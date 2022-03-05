import { removeValuefromArray, unique } from "./util";
import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";
import { setVariable as setMathVariable, getDependencies as getMathDependencies } from "./mathUtil";
import { GameTime, GameVar, GameBuyable, GameCalculation, GameVarPlain } from "./GameVar";
import { GameMilestoneManager, MilestoneRewardAction } from "./GameMilestoneManager";

export const defaultUiVarFields: UiVarFields = {
    value: 0, cost: 0, sellCost: 0, total: 0
};

export interface UiVarFields {
    value: number;
    cost: number;
    sellCost: number;
    total: number;
}

export type UIVarFieldKeys = 'value' | 'cost' | 'sellCost' | 'total';


export interface UiStateMethods<T> {
    cloner: (state: any) => T; // make a fresh copy of the state for save/load
    varAdder: (state: T, name: string) => void; 
    varGetter: (state: T, name: string, key: string) => number;
    varSetter: (state: T, name: string, key: string, value) => void;
    milestoneGetter: (state: T, name: string ) => boolean;
    milestoneSetter: (state: T, name: string, gotten ) => void;
    
}

export class GameVarManager<T> {


    private readonly uiState: T;
    private readonly uiStateMethods: UiStateMethods<T>;
    private readonly milestoneManager: GameMilestoneManager<T>;


    constructor(uiState: T, uiStateMethods: UiStateMethods<T>, milestoneManager: GameMilestoneManager<T>) {
        this.uiState = uiState;
        this.uiStateMethods = uiStateMethods;
        this.milestoneManager = milestoneManager;

        // debugger;
        this.add(GameTime.instance);
    }

    getUiVarField(from: string|GameVar, field: UIVarFieldKeys) {
        const gameVar : GameVar = typeof from === 'string' ? this.get(from) : from;
        if ( field === 'value') { return gameVar.value; } 
        else if ( field === 'total' && gameVar instanceof GameBuyable) { return gameVar.totalBought; }
        else if ( field === 'cost' && gameVar instanceof GameBuyable) { return gameVar.cost; }
        else if ( field === "sellCost" && gameVar instanceof GameBuyable) { return gameVar.sellCost; }
        else { return NaN; }
    }
    
    setUiVarField(from: string|GameVar, field: UIVarFieldKeys, value: number | 'dirty' = NaN) {
        const gameVar : GameVar = typeof from === 'string' ? this.get(from) : from;
        if ( value === 'dirty') { this._dirty.push(gameVar.name);}
        let val = value;
        if ( val  == 'dirty' || isNaN(val)) {
            val = this.getUiVarField(gameVar, field);
        }
         this.uiStateMethods.varSetter(this.uiState, gameVar.name, field, val);
         if ( field === 'value' ) { 
             setMathVariable(gameVar.name, val); 
             this.handleMilestoneUpdate(gameVar.name);
         }
    }
    
    private setUiVarFields(from: string|GameVar, makeDirty: 'clean' | 'dirty' = 'clean') {
        const gameVar : GameVar = typeof from === 'string' ? this.get(from) : from;
        if ( makeDirty === 'dirty') { this._dirty.push(gameVar.name);}
        this.setUiVarField(gameVar, 'cost');
        this.setUiVarField(gameVar, 'sellCost');
        this.setUiVarField(gameVar, 'value');
        this.setUiVarField(gameVar, 'total');
    }
    
    newCalculation(
        name: string,
        displayName: string,
        visible: boolean,
        fn: FunctionDef,
        args: argMap
    ): GameCalculation {

        const ret = new GameCalculation(name, displayName, visible, fn, args);
        this.add(ret);
        return ret;
    }

    newPlain(
        name: string,
        displayName: string,
        visible: boolean,
        value: number
    ): GameVarPlain {
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
    ): GameBuyable {
        const ret = new GameBuyable(name, displayName, visible, fn, args, currency, sellable);
        this.add(ret);
        this.setUiVarField(ret,'value');
        this.setUiVarField(ret,'cost');

        const currencyVar = this._items[currency];
        if (currencyVar instanceof GameCalculation) {
            currencyVar.fn = FunctionDefManager.adjust(
                currencyVar.fn, name + '_' + currency,
                (body) => body + ' - ' + fn.callStr(args).replace(name, name + '_total') + ' + ' + fn.callStrEvaluatedArgs(args)
            );
        }
        this.setUiVarField(currencyVar, "value", 'dirty');
        return ret;
    }

    add(g: GameVar) {
        this.uiStateMethods.varAdder(this.uiState, g.name);

        this._dependencies[g.name] = [];
        this._calculateDependencies(g);
        this._deepDependencies[g.name] = getMathDependencies(g.fn, g.args);
        this._order.push(g.name);
        this._items[g.name] = g;
        this.setUiVarField(g, 'value', 'dirty');
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

    tick(elapsedTime: number): void {
        const t = (this._items.t as GameTime);
        t.time += elapsedTime;
        this.setUiVarField(t, 'value', t.time);
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
    }

    isBuyable(varName) {
        const gameVar = this.get(varName);
        return gameVar instanceof GameBuyable && gameVar.buyable;
    }

    isSellable(varName) {
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
        if (!(buyable instanceof GameBuyable)) { return; }

        return this.get(buyable.currency);
    };

    getCurrencyName(varName) {
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

        buyable.buy();
        this.setUiVarFields(buyable, 'dirty');

        currency.spend(cost);
        this.setUiVarFields(currency, 'dirty');

    }

    setFromUIValues(): void {

        this._order.forEach((varName) => {
            const gameVar = this._items[varName];
            if (gameVar instanceof GameBuyable) {
                gameVar.forceSetCounts(
                    this.uiStateMethods.varGetter(this.uiState, varName, 'value'), 
                    this.uiStateMethods.varGetter(this.uiState, varName, 'total')
                );
            } else if (gameVar instanceof GameTime) {
                gameVar.time = this.uiStateMethods.varGetter(this.uiState, varName, 'value');
            }
            this._dirty.push(varName);
            setMathVariable(varName, this.uiStateMethods.varGetter(this.uiState, varName, 'value'));
            this.handleMilestoneUpdate(varName);

        });
    }
    
    handleMilestoneUpdate(varName: string) : void {
        const actions: MilestoneRewardAction[] = this.milestoneManager.handleUpdate(varName);
        actions.forEach( (action) => {
            if ( action.setSellable ) {
                for( let varName in action.setSellable) {
                    const gameVar = this.get(varName);
                    if ( gameVar instanceof GameBuyable) { 
                        gameVar.sellable = true;
                    } 
                }
            }
        });
    }
}
