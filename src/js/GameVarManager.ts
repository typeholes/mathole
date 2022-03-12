import { removeValuefromArray, unique } from "./util";
import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";
import { setVariable as setMathVariable, getDependencies as getMathDependencies, replaceSymbols, M } from "./mathUtil";
import { GameTime, GameVar, GameBuyable, GameCalculation, GameVarPlain, GameToggle } from "./GameVar";
import { GameMilestoneManager } from "./GameMilestoneManager";
import { GameAction, NoGameAction } from "./GameAction";
import { Action, TickBuffer } from "./TickBuffer";
import { UiStateWriter } from "./UiStateWriter";

export interface RequiredVarFields {
    value: number;
    cost: number;
    sellCost: number;
    total: number;
}

export interface RequiredMilestoneFields {
    reached: boolean;
}

export interface RequiredStateFields<V extends RequiredVarFields, M extends RequiredMilestoneFields> {
    vars: {[any: string] : V},
    milestones: {[any: string] : M }
}
export const defaultUiVarFields: RequiredVarFields = {
    value: 0, cost: 0, sellCost: 0, total: 0
};

export const defaultUiMilestoneFields: RequiredMilestoneFields = {
    reached: false
}


// I wish I could use this type but it always resolves to the never case when used in the generic class.  Either I'm doing something wrong or TS is too eager and shrinks T extends X to X. 
//type Extra<Required, Full extends Required> = Required extends Full ? Record<string, never> : Omit<Full, keyof Required>;
type Extra<Required, Full extends Required> = Omit<Full, keyof Required>;


export type ExtraVarFields<V extends RequiredVarFields> = Extra<RequiredVarFields, V>;

export type ExtraMilestoneFields<M extends RequiredMilestoneFields> = Extra<RequiredMilestoneFields, M>;

export interface UiStateMethods<S extends RequiredStateFields<V,M>, V extends RequiredVarFields, M extends RequiredMilestoneFields> {
    cloner: (state: any) => S; // make a fresh copy of the state for save/load
    varAdder: (state: S, name: string, extra: ExtraVarFields<V>) => void; 
    varGetter: (state: S, name: string, key: keyof V) => number;
    varSetter: (state: S, name: string, key: keyof V, value: any) => void; // TODO fix any
    milestoneAdder: (state: S, n: string, extra: ExtraMilestoneFields<M>) => void,
    milestoneGetter: (state: S, name: string ) => boolean;
    milestoneSetter: (state: S, name: string, gotten: boolean ) => void; // TODO propable need to be able to set extra milestone fields
}

type NewPlainArgs<V extends RequiredVarFields> = {
    name: string,
    displayName: string,
    visible: boolean,
    value: number,
    extra: ExtraVarFields<V>
};

type NewToggleArgs<V extends RequiredVarFields> = {
    name: string,
    displayName: string,
    visible: boolean,
    reversible: boolean,
    gameAction?: GameAction<V>,
    extra: ExtraVarFields<V>
};

type NewBuyableArgs<V extends RequiredVarFields> = {
    name: string,
    displayName: string,
    visible: boolean,
    fn: FunctionDef,
    args: argMap,
    currency: string,
    sellable: boolean,
    extra: ExtraVarFields<V>
}

type NewCalculationArgs<V extends RequiredVarFields> = {
    name: string,
    displayName: string,
    visible: boolean,
    fn: FunctionDef,
    args: argMap,
    extra: ExtraVarFields<V>
}

export class GameVarManager<S extends RequiredStateFields<V,M>, V extends RequiredVarFields, M extends RequiredMilestoneFields> {

    private readonly uiStateWriter: UiStateWriter<S,V,M>;
    private readonly milestoneManager: GameMilestoneManager<M,V>;

    constructor(uiStateWriter: UiStateWriter<S,V,M>, defaultVarExtra: ExtraVarFields<V>, milestoneManager: GameMilestoneManager<M,V>) {
        this.uiStateWriter = uiStateWriter;
        this.milestoneManager = milestoneManager;

        // debugger;
        this.add(GameTime.instance, defaultVarExtra);
    }

    getUiVarField(from: string|GameVar, field: keyof V) {
        const gameVar : GameVar = typeof from === 'string' ? this.get(from) : from;
        if ( field === 'value') { return gameVar.value; } 
        else if ( field === 'total' && gameVar instanceof GameBuyable) { return gameVar.totalBought; }
        else if ( field === 'cost' && gameVar instanceof GameBuyable) { return gameVar.cost; }
        else if ( field === "sellCost" && gameVar instanceof GameBuyable) { return gameVar.sellCost; }
        else { return NaN; }
    }
    
    setRequiredVarField(from: string|GameVar, field: keyof RequiredVarFields, value: number | 'dirty' = NaN) {
        const gameVar : GameVar = typeof from === 'string' ? this.get(from) : from;
        if ( value === 'dirty') { this._dirty.push(gameVar.name);}
        let val = value;
        if ( val  == 'dirty' || isNaN(val as any)) {
            val = this.getUiVarField(gameVar, field);
        }
         this.uiStateWriter.setVarField(gameVar.name, field, val);
         if ( field === 'value' || field === 'total') { 
             setMathVariable(gameVar.name + ( field === 'total' ? '_total' : ''), val); 
             this.handleMilestoneUpdate(gameVar.name);
         }
    }
    
    private setUiVarFields(from: string|GameVar, makeDirty: 'clean' | 'dirty' = 'clean') {
        const gameVar : GameVar = typeof from === 'string' ? this.get(from) : from;
        if ( makeDirty === 'dirty') { this._dirty.push(gameVar.name);}
        this.setRequiredVarField(gameVar, 'cost');
        this.setRequiredVarField(gameVar, 'sellCost');
        this.setRequiredVarField(gameVar, 'value');
        this.setRequiredVarField(gameVar, 'total');
    }
    
    newCalculation( args: NewCalculationArgs<V> ): GameCalculation {

        const ret = new GameCalculation(args.name, args.displayName, args.fn, args.args);
        this.add(ret, args.extra);
        return ret;
    }

        
    newPlain( args : NewPlainArgs<V> ) : GameVarPlain {
        
        const ret = new GameVarPlain(args.name, args.displayName);
        this.add(ret, args.extra);
        ret.spend(-1 * args.value);
        return ret;
    }

    newToggle( args: NewToggleArgs<V>) : GameToggle<V> {
        const ret = new GameToggle(args.name, args.displayName, args.reversible, args.gameAction || NoGameAction);
        this.add(ret, args.extra);
        
        return ret;
    }

    newBuyable( args: NewBuyableArgs<V> ) : GameBuyable {
        const ret = new GameBuyable(args.name, args.displayName, args.fn, args.args, args.currency, args.sellable);
        this.add(ret, args.extra);
        this.setRequiredVarField(ret,'value');
        this.setRequiredVarField(ret,'cost');

        const currencyVar = this._items[args.currency];
        if (currencyVar instanceof GameCalculation) {
            currencyVar.fn = FunctionDefManager.adjust(
                currencyVar.fn, name + '_' + args.currency,
                (body) => body + ' - ' + args.fn.callStr(args.args).replace(args.name, args.name + '_total') + ' + ' + args.fn.callStrEvaluatedArgs(args.args)
            );
        }
        this.setRequiredVarField(currencyVar, "value", 'dirty');
        return ret;
    }

    add(g: GameVar, extra: ExtraVarFields<V>) {
        this.uiStateWriter.addVar( g.name, extra);

        this._dependencies[g.name] = [];
        this._calculateDependencies(g);
        this._deepDependencies[g.name] = getMathDependencies(g.fn, g.args);
        this._order.push(g.name);
        this._items[g.name] = g;
        this.setRequiredVarField(g, 'value', 'dirty');
    }

    private _calculateDependencies(tgt: GameVar): void {
        for (const name in this._items) {
            if (tgt.dependsOn(name)) {
                this._dependencies[name].push(tgt.name);
            }
        }
    };


    get(name: string) {
        return this._items[name];
    }

    getNames(): string[] {
        return [...this._order];
    }

    private _items: { [index: string]: GameVar; } = { t: GameTime.instance };
    private _order: string[] = [];
    private _dependencies: { [index: string]: string[]; } = {};
    private _deepDependencies: { [index: string]: string[]; } = {};
    private _dirty: string[] = [];
    private _tickBuffer: TickBuffer = new TickBuffer();


    asap(...actions: Action[]) : void { this._tickBuffer.asap(...actions) };
    schedule(action: Action, waitAfter=0, minWait=0) : void { this._tickBuffer.schedule(action, waitAfter, minWait) }

    tick(elapsedTime: number): void {
        const t = (this._items.t as GameTime);
        t.time += elapsedTime;
        this.setRequiredVarField(t, 'value', t.time);
        this._dirty.push('t');

        for (let i = 0; i<2; i++) { // run through dirty twice so we process the fallout of the first pass
            const ran: string[] = [];

            this._order.forEach((name) => {
                if (this._dirty.includes(name)) {
                    const dirtyVar = this._items[name];

                    this.setUiVarFields(dirtyVar);

                    this._dirty.push(...this._dependencies[name]);
                    ran.push(name);
                }
                this._dirty = unique( this._dirty );
                ran.forEach( (ranName ) => { removeValuefromArray( this._dirty, ranName); });
            });
        }
        
        this._tickBuffer.tick();
    }

    isBuyable(varName: string) {
        const gameVar = this.get(varName);
        return gameVar instanceof GameBuyable && gameVar.buyable;
    }

    isToggle(varName: string) {
        const gameVar = this.get(varName);
        return gameVar instanceof GameToggle;
    }

    isSellable(varName: string) {
        const gameVar = this.get(varName);
        return gameVar instanceof GameBuyable && gameVar.sellable;
    }

    getDependencies(varName: string): string[] {
        const deps = this._deepDependencies[varName] || [];
        const childDeps = deps.map((dep) => this.getDependencies(dep)).flat();

        deps.push(...childDeps);

        return deps;

    }

    getDependents(varName: string): string[] {
        const ret: string[] = [];

        this._order.forEach((name) => {
            if (this._deepDependencies[name].includes(varName))
                ret.push(name);
        });
        return ret;
    }

    getCurrency(varName: string): GameVar {
        const buyable = this.get(varName);
        if (!(buyable instanceof GameBuyable)) { throw varName + ' does not have a currency'; }

        return this.get(buyable.currency);
    };

    getCurrencyName(varName: string) {
        const currency = this.getCurrency(varName);
        if (!currency) { return ""; }
        return currency.name;
    }

    sell(varName: string) {
        const buyable = this.get(varName);
        if (!(buyable instanceof GameBuyable)) { return; }

        const currencyName = this.getCurrencyName(varName);
        const currency = this.get(currencyName);

        const cost = buyable.cost;

        buyable.spend(1);
        this.setUiVarFields(buyable, 'dirty');
        
        currency.spend(cost * -1);
        this.setUiVarFields(currency, 'dirty');

    }

    buy(varName: string) {
        const buyable = this.get(varName);
        if (!(buyable instanceof GameBuyable)) { return; }

        const currencyName = this.getCurrencyName(varName);
        const currency = this.get(currencyName);

        const cost = buyable.cost;
        if (cost > this.getUiVarField(currency, 'cost')) { return; }

        const { gameAction, state } = buyable.buy();
        this.setUiVarFields(buyable, 'dirty');

        if (currency) { 
            currency.spend(cost);
            this.setUiVarFields(currency, 'dirty');
        }

        this.handleAction( gameAction, state ); 

    }

    setFromUIValues(): void {

        this._order.forEach((varName) => {
            const gameVar = this._items[varName];
            if (gameVar instanceof GameBuyable) {
                gameVar.forceSetCounts(
                    this.uiStateWriter.getVarField( varName, 'value'), 
                    this.uiStateWriter.getVarField( varName, 'total')
                );
            } else if (gameVar instanceof GameTime) {
                gameVar.time = this.uiStateWriter.getVarField( varName, 'value');
            }
            this._dirty.push(varName);
            setMathVariable(varName, this.uiStateWriter.getVarField( varName, 'value'));
            setMathVariable(varName + '_total', this.uiStateWriter.getVarField( varName, 'value'));
            this.handleMilestoneUpdate(varName);

        });
    }
    
    handleMilestoneUpdate(varName: string) : void {
        const actions: GameAction<V>[] = this.milestoneManager.handleUpdate(varName);
        actions.forEach( (action) => this.handleAction(action) );
    }

    handleAction(action: GameAction<V>, state = true) {
        if ( action.setUiFields ) {
            for( let varName in action.setUiFields) {
                    this.uiStateWriter.setVarFields(varName, action.setUiFields[varName] as V);
            }
        }
        if ( action.setBuyable ) {
            for( let varName in action.setBuyable) {
                const gameVar = this.get(varName);
                if ( gameVar instanceof GameBuyable) { 
                    gameVar.buyable = state;
                } 
            }
        }
        if ( action.setSellable ) {
            for( let varName in action.setSellable) {
                const gameVar = this.get(varName);
                if ( gameVar instanceof GameBuyable) { 
                    gameVar.sellable = state;
                } 
            }
        }
        if ( action.adjustFunctions ) {
            if (! state) { throw "Undoing adjustFunction GameActions not implemented"; } //TODO
            for( let varName in action.adjustFunctions) {
                for ( const fnType in action.adjustFunctions[varName]) {
                    const newBody = action.adjustFunctions[varName][fnType];
                    this.adjustFnOf(varName, fnType, newBody, 'M' );
                }
            }
        }
    }
    
    private adjustFnOf(varName: string, fnType: string, newBody: string, suffix: string) {
        const gameVar = this.get(varName);
        const uniqueSuffix = '_' + suffix + FunctionDefManager.makeUniqueSuffix();
       
        let fn: FunctionDef;
        let setter: (newFn: FunctionDef) => void;
        if ( fnType === 'value' && !(gameVar instanceof GameBuyable)) {
            fn = gameVar.fn;
            setter = (newFn) => gameVar.fn = newFn;
        } else if ( fnType === 'cost' && gameVar instanceof GameBuyable) {
           fn = gameVar.fn; 
           setter = (newFn) => gameVar.fn = newFn;
        } else if ( fnType === 'sellCost' && gameVar instanceof GameBuyable) {
           fn = gameVar.sellFn;
           setter = (newFn) => gameVar.sellFn = newFn;
        } else {
            throw('invalid fnType ' + fnType + ' for ' + gameVar.name);
        }
        
        let newFn = FunctionDefManager.adjust(
            fn, fn.name + uniqueSuffix, 
            (body) => newBody.replace('<&>', fn.signatureString() )
        );
        setter(newFn);
    }
        
    getDisplayExpr(expr: string) : string {
        const entries = this._order.map( (name) => [name, this.get(name).displayName]);
        const map = Object.fromEntries(entries);
        const ret = replaceSymbols(expr, map);
        return ret;
    }
}
