import { removeValuefromArray } from "./util";
import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";
import { displayFunction, setVariable as setMathVariable } from "./mathUtil";

import { parser } from "./mathUtil";


export type uiVarMap = { [any: string]: uiVar };
export type uiVar = { value: number, cost: number};

export abstract class GameVar { 
    readonly name: string;
    readonly displayName: string;
    readonly visible: boolean;
    fn: FunctionDef;
    readonly args: argMap;

    get value( ) : number {
        const p = parser;
        const val = this.fn.run( this.args);
        return val;
    };

    constructor(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap
    ) {
        this.name = name;
        this.displayName = displayName;
        this.visible = visible;
        this.fn = fn;
        this.args = args;
    }

    dependsOn(name: string): boolean {
        const found = Object.values(this.args).find( (argValue) => typeof argValue === 'string' && argValue.split(/[^a-zA-Z]/).includes(name));
        return ! (typeof found === 'undefined');
    }
}       

class GameTime extends GameVar {
    static readonly  instance = new GameTime();
    time: number = 0;

    private constructor () {
        super( 't', 'Time', false, null, {});
    }

    get value(): number {
        return this.time;
    }
}

export class GameCalculation extends GameVar  { 
}

export class GameBuyable extends GameVar {
    forceSetCounts(cnt: number, totalCnt: number) {
        this._cntBought = cnt;
        this._totalBought = totalCnt;
    }

    private _cntBought = 0; 
    private _totalBought = 0;
    currency: string;

    constructor(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap,
        currency: string
    ) {
        super(name, displayName, visible, fn, args);
        this.currency = currency;
    }

    get cost () {
       return super.value;
    }

    get value(): number {
        return this._cntBought;
    }

    get totalBought() {
        return this._totalBought;
    }

    buy(): void {
        this._cntBought++;
        this._totalBought++;
    }

    spend(cnt: number): void {
        this._cntBought -= cnt;
    }
}


export class GameVarManager<T> {   


    private readonly uiState: T;
    private readonly varAdder: (uiState: T, name: string) => void;
    private readonly costGetter: (uiState: T, name: string) => number;
    private readonly costSetter: (uiState: T, name: string, cost: number) => void;
    private readonly valueGetter: (uiState: T, name: string) => number;
    private readonly valueSetter: (uiState: T, name: string, value: number) => number;


    constructor
    ( uiState: T
    , varAdder: (uiState: T, name: string) => void
    , costGetter: (uiState: T, name: string) => number
    , costSetter: (uiState: T, name: string, cost: number) => void
    , valueGetter: (uiState: T, name: string) => number
    , valueSetter: (uiState: T, name: string, value: number) => number
    ) {
        this.uiState = uiState;
        this.varAdder = varAdder;
        this.costGetter = costGetter;
        this.costSetter = costSetter;
        this.valueGetter = valueGetter;
        this.valueSetter = valueSetter;
        
        debugger;
        this.add(GameTime.instance);
    }

    getUIValue(gameVar: GameVar) : number {
        return this.valueGetter(this.uiState, gameVar.name);
    }

    setUIValue(gameVar: GameVar, makeDirty: "dirty"|"clean" = "clean") : void {
        const value = gameVar.value;
        const varName = gameVar.name;
        this.valueSetter(this.uiState, varName, value);
        setMathVariable(varName, value);

        if (gameVar instanceof GameBuyable) {
            this.valueSetter( this.uiState, gameVar.name + '_total', gameVar.totalBought);
            setMathVariable(varName + '_total', gameVar.totalBought);
        }
        if (makeDirty === "dirty") {
            this._dirty.push(varName);
        }
    }

    getUICost(gameVar: GameVar) : number {
        return this.costGetter(this.uiState, gameVar.name);
    }

    setUICost(gameVar: GameVar) : void {
        if ( gameVar instanceof GameBuyable) {
            this.costSetter(this.uiState, gameVar.name, gameVar.cost);
        }
    }

    newCalculation(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap
    ) : GameCalculation {
   
        const ret = new GameCalculation(name, displayName, visible, fn, args) ;
        this.add(ret);
        return ret;
    }

    newBuyable(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap, 
        currency: string
    ) : GameBuyable {
        this.varAdder(this.uiState, name + '_total');
   
        const ret = new GameBuyable(name, displayName, visible, fn, args, currency) ;
        this.add(ret);
        this.setUIValue(ret);
        this.setUICost(ret);

        const currencyVar = this._items[currency];
        if (currencyVar instanceof GameCalculation) {
             currencyVar.fn = FunctionDefManager.adjust(currencyVar.fn, name + '_' + currency, (body) =>
                body + ' - ' + fn.callStr(args).replace(name, name + '_total') + ' + ' +  fn.callStrEvaluatedArgs(args)
                );
        }
        this.setUIValue(currencyVar, 'dirty');
        return ret;
    }

    add(g: GameVar) {
        this.varAdder(this.uiState, g.name);

        this._dependencies[g.name] = [];
        this._calculateDependencies(g);
        this._order.push( g.name );
        this._items[g.name] = g;
        this.setUIValue(g, "dirty");
    }

    get(name: string) {
        return this._items[name];
    }
   
    getNames() : string[] {
        return [...this._order];
    }

    private _items: {[index: string]: GameVar} = {t: GameTime.instance};
    private _order: string[] = [];
    private _dependencies: {[index: string]: string[]} =  { };
    private _dirty: string[] = [];

    private _calculateDependencies(tgt: GameVar) : void {
        for( const name in this._items) {
            if (tgt.dependsOn(name)) {
                this._dependencies[name].push(tgt.name);
            }     
        }
    };

    tick(elapsedTime: number) : void {

  
        const t = (this._items.t as GameTime);
        t.time += elapsedTime;
        this.valueSetter(this.uiState, 't', t.time);
        this._dirty.push('t');
               
        const ran: string[] = [];

        this._order.forEach( (name) => {
            if (this._dirty.includes(name)) {
                const dirtyVar = this._items[name];
                
                this.setUIValue(dirtyVar);

                removeValuefromArray(this._dirty, name);

                this._dirty.push(...this._dependencies[name]);
                ran.push(name);
            }

        });
    }

    isBuyable(varName) {
        return this.get(varName) instanceof GameBuyable;
    }

    getCurrency(varName: string) : GameVar {
        const buyable = this.get(varName);
        if ( ! (buyable instanceof GameBuyable)) {return;}
        
        return this.get(buyable.currency);
    };

    getCurrencyName(varName) {
        const currency = this.getCurrency(varName);
        if (!currency) { return ""; }
        return currency.name;
    }
 
    buy(varName: string) {
        const buyable = this.get(varName);
        if ( ! (buyable instanceof GameBuyable)) { return; }

        const currencyName = this.getCurrencyName(varName);
        const currency = this.get(currencyName);

        const cost = buyable.cost;
        if (cost > this.valueGetter(this.uiState, currencyName)) { return; }
        
        buyable.buy();
        this.setUIValue(currency, 'dirty');
        
        this.setUIValue(buyable, 'dirty');
        this.setUICost(buyable);
        if (currency instanceof GameBuyable) { 
            currency.spend(cost);
            this.setUIValue(currency);
            this.setUICost(currency); 
        }

        this._dirty.push(varName);

        displayFunction(FunctionDefManager.get('calcMarketValue'),'', '#test-graph-expr', {});  
    }

    setFromUIValues() : void {

        this._order.forEach( (varName) => {
            const gameVar = this._items[varName];
            if (gameVar instanceof GameBuyable) {
                gameVar.forceSetCounts( this.valueGetter(this.uiState, varName), this.valueGetter(this.uiState, varName + '_total'));
            } else if(gameVar instanceof GameTime) {
                gameVar.time = this.valueGetter(this.uiState, varName);
            }
            this._dirty.push(varName);
            setMathVariable(varName, this.valueGetter(this.uiState, varName));
        });
    }
}
