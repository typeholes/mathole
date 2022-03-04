import { removeValuefromArray } from "./util";
import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";
import { setVariable as setMathVariable, getDependencies as getMathDependencies } from "./mathUtil";

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
    
    spend(cnt: number) :  void {
        // does nothing by default as GameVars with value driven by fn will have their fn adjusted to account for spent cnt
    }

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
    buyable: boolean = true;
    sellable: boolean = false;

    constructor(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap,
        currency: string, 
        sellable: boolean,
        buyable: boolean = true
    ) {
        super(name, displayName, visible, fn, args);
        this.currency = currency;
        this.sellable = sellable;
        this.buyable = buyable;
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

export class GameVarPlain extends GameBuyable {

    constructor(
        name: string,
        displayName: string,
        visible: boolean
    ) {
        super(name, displayName, visible, FunctionDefManager.get('id'), {x: name}, "", false, false); // TODO replace with id after providing builtin functionDefs
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
        
        // debugger;
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

    newPlain(
        name: string,
        displayName: string,
        visible: boolean,
        value: number
    ) : GameVarPlain {
        this.varAdder(this.uiState, name + '_total');

        const ret = new GameVarPlain(name, displayName, visible);
        this.add(ret);
        ret.spend(-1 * value);
        return ret;
    }

    newBuyable(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap, 
        currency: string,
        sellable: boolean
    ) : GameBuyable {
        this.varAdder(this.uiState, name + '_total');
   
        const ret = new GameBuyable(name, displayName, visible, fn, args, currency, sellable) ;
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
        this._deepDependencies[g.name] = getMathDependencies(g.fn, g.args);
        this._order.push( g.name );
        this._items[g.name] = g;
        this.setUIValue(g, "dirty");
    }

    private _calculateDependencies(tgt: GameVar) : void {
        for( const name in this._items) {
            if (tgt.dependsOn(name)) {
                this._dependencies[name].push(tgt.name);
            }
        }
    };

        
    get(name: string) {
        return this._items[name];
    }
   
    getNames() : string[] {
        return [...this._order];
    }

    private _items: {[index: string]: GameVar} = {t: GameTime.instance};
    private _order: string[] = [];
    private _dependencies: {[index: string]: string[]} =  { };
    private _deepDependencies: {[index: string]: string[]} =  { };
    private _dirty: string[] = [];

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
                this.setUICost(dirtyVar);

                removeValuefromArray(this._dirty, name);

                this._dirty.push(...this._dependencies[name]);
                ran.push(name);
            }

        });
    }

    isBuyable(varName) {
        const gameVar = this.get(varName);
        return gameVar instanceof GameBuyable && gameVar.buyable;
    }

    isSellable(varName) {
        const gameVar = this.get(varName);
        return gameVar instanceof GameBuyable && gameVar.sellable;
    }

    getDependencies(varName: string) : string[] {
        const deps = this._deepDependencies[varName] || [];
        const childDeps = deps.map( (dep) => this.getDependencies(dep) ).flat();

        deps.push(...childDeps);

        return deps;

    }

    getDependents(varName: string) : string[] {
        const ret : string[] = [];

        this._order.forEach( (name) => {
            if ( this._deepDependencies[name].includes(varName) ) ret.push(name);
        });
        return ret;
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
 
    sell(varName: string) {
        const buyable = this.get(varName);
        if ( ! (buyable instanceof GameBuyable)) { return; }

        const currencyName = this.getCurrencyName(varName);
        const currency = this.get(currencyName);

        const cost = buyable.cost;
        
        buyable.spend(1);
        this.setUIValue(currency, 'dirty');
        
        this.setUIValue(buyable, 'dirty');
        this.setUICost(buyable);
        currency.spend(cost * -1);
        this.setUIValue(currency);
        this.setUICost(currency); 

        this._dirty.push(varName);

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
        currency.spend(cost);
        this.setUIValue(currency);
        this.setUICost(currency); 

        this._dirty.push(varName);

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
