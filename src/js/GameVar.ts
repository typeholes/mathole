import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";

import { parser } from "./mathUtil";

export abstract class GameVar { 
    readonly name: string;
    readonly displayName: string;
    visible: boolean;
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
        super( 't', 'Time', false, FunctionDefManager.get('id'), {'x': 't'});
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

    protected _cntBought = 0; 
    protected _totalBought = 0;
    currency: string;
    buyable: boolean = true;
    sellable: boolean = false;
    sellFn: FunctionDef;
    sellArgs: argMap;

    constructor(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap,
        currency: string, 
        sellable: boolean,
        sellFn: FunctionDef = fn,
        sellArgs: argMap = args,
        buyable: boolean = true
    ) {
        super(name, displayName, visible, fn, args);
        this.currency = currency;
        this.sellable = sellable;
        this.buyable = buyable;
        this.sellFn = sellFn;
        this.sellArgs = sellArgs;
    }

    get cost () {
       return super.value;
    }

    get sellCost() {
        const p = parser;
        const val = this.sellFn.run( this.sellArgs);
        return val;
    };

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
        const id = FunctionDefManager.get('id');
        const args = {x: name};

        super(name, displayName, visible, id, args, "", false, id, args, false); // TODO replace with id after providing builtin functionDefs
    }
}

export class GameToggle extends GameBuyable {
    reversible: boolean;

    constructor(
        name: string,
        displayName: string,
        visible: boolean,
        reversible: boolean
    ) {
        const id = FunctionDefManager.get('id');
        const args = {x: '0'};

        super(name, displayName, visible, id, args, "", false, id, args, false); // TODO replace with id after providing builtin functionDefs
        
        this.reversible = reversible
    }
    
    buy() : void { 
        if ( this._cntBought == 0 ) {
            this._cntBought = 1;
            this._totalBought = 1;
            if (! this.reversible) { this.visible = false; }
        } else {
            if ( this.reversible ) {
                this._cntBought = 0;
            }
        }
    }
}



