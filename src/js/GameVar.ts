import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";

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

export class GameTime extends GameVar {
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



