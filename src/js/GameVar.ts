import { removeValuefromArray } from "../util";
import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";
import { displayFunction, setVariable as setMathVariable } from "./mathUtil";

import { parser } from "./mathUtil";


export type uiVarMap = { [any: string]: uiVar };
export type uiVar = { value: number, cost: number};

export abstract class GameVar { 
    readonly name: string;
    readonly displayName: string;
    readonly visible: boolean;
    readonly fn: FunctionDef;
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

    private _cntBought = 0; 

    get cost () {
       return super.value;
    }

    get value(): number {
        return this._cntBought;
    }

    buy(): void {
        this._cntBought++;
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
        args: argMap
    ) : GameBuyable {
   
        const ret = new GameBuyable(name, displayName, visible, fn, args) ;
        this.add(ret);
        return ret;
    }

    add(g: GameVar) {
        this.varAdder(this.uiState, g.name);
        
        this._dependencies[g.name]=[];
        this._calculateDependencies(g);
        this._order.push( g.name );
        this._items[g.name] = g;
        this._dirty.push(g.name);
        setMathVariable(g.name, 0);
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
    //        const g = this._items[name]; 
            if (tgt.dependsOn(name)) {
                this._dependencies[name].push(tgt.name);
            }     
        }
    };

    tick(elapsedTime: number) : void {

  
        const t = (this._items.t as GameTime);
        t.time += elapsedTime;
        setMathVariable('t', t.time);
        this.valueSetter(this.uiState, 't', t.time);
        this._dirty.push('t');
               
        const ran: string[] = [];

  

        this._order.forEach( (name) => {
            if (this._dirty.includes(name)) {
                const val = this._items[name].value;
                this.valueSetter(this.uiState, name, val);
                setMathVariable(name, val);

                removeValuefromArray(this._dirty, name);

                this._dirty.push(...this._dependencies[name]);
                ran.push(name);
            }

        });
    }

    isBuyable(varName) {
        return this.get(varName) instanceof GameBuyable;
    }

    buy(varName) {
        const buyable = this.get(varName);
        if ( ! (buyable instanceof GameBuyable)) return;
        
        buyable.buy();
        
        this.costSetter(this.uiState, varName, buyable.cost);
        this._dirty.push(varName);

        displayFunction(FunctionDefManager.get('sawtooth'),'', '#test-graph-expr', {});  
    }

}
