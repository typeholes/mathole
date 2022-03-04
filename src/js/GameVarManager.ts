import { removeValuefromArray } from "./util";
import { argMap, FunctionDef, FunctionDefManager } from "./FunctionDef";
import { setVariable as setMathVariable, getDependencies as getMathDependencies } from "./mathUtil";
import { GameTime, GameVar, GameBuyable, GameCalculation, GameVarPlain } from "./GameVar";



export class GameVarManager<T> {


    private readonly uiState: T;
    private readonly varAdder: (uiState: T, name: string) => void;
    private readonly sellCostGetter: (uiState: T, name: string) => number;
    private readonly sellCostSetter: (uiState: T, name: string, cost: number) => void;
    private readonly costGetter: (uiState: T, name: string) => number;
    private readonly costSetter: (uiState: T, name: string, cost: number) => void;
    private readonly valueGetter: (uiState: T, name: string) => number;
    private readonly valueSetter: (uiState: T, name: string, value: number) => number;


    constructor(uiState: T,
        varAdder: (uiState: T, name: string) => void,
        sellCostGetter: (uiState: T, name: string) => number,
        sellCostSetter: (uiState: T, name: string, cost: number) => void,
        costGetter: (uiState: T, name: string) => number,
        costSetter: (uiState: T, name: string, cost: number) => void,
        valueGetter: (uiState: T, name: string) => number,
        valueSetter: (uiState: T, name: string, value: number) => number
    ) {
        this.uiState = uiState;
        this.varAdder = varAdder;
        this.costGetter = costGetter;
        this.costSetter = costSetter;
        this.valueGetter = valueGetter;
        this.valueSetter = valueSetter;
        this.sellCostGetter = sellCostGetter;
        this.sellCostSetter = sellCostSetter;

        // debugger;
        this.add(GameTime.instance);
    }

    getUIValue(gameVar: GameVar): number {
        return this.valueGetter(this.uiState, gameVar.name);
    }

    setUIValue(gameVar: GameVar, makeDirty: "dirty" | "clean" = "clean"): void {
        const value = gameVar.value;
        const varName = gameVar.name;
        this.valueSetter(this.uiState, varName, value);
        setMathVariable(varName, value);

        if (gameVar instanceof GameBuyable) {
            this.valueSetter(this.uiState, gameVar.name + '_total', gameVar.totalBought);
            setMathVariable(varName + '_total', gameVar.totalBought);
        }
        if (makeDirty === "dirty") {
            this._dirty.push(varName);
        }
    }

    getUISellCost(gameVar: GameVar): number {
        return this.sellCostGetter(this.uiState, gameVar.name);
    }

    setUISellCost(gameVar: GameVar): void {
        if (gameVar instanceof GameBuyable) {
            this.sellCostSetter(this.uiState, gameVar.name, gameVar.sellCost);
        }
    }

    getUICost(gameVar: GameVar): number {
        return this.costGetter(this.uiState, gameVar.name);
    }

    setUICost(gameVar: GameVar): void {
        if (gameVar instanceof GameBuyable) {
            this.costSetter(this.uiState, gameVar.name, gameVar.cost);
        }
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
    ): GameBuyable {
        this.varAdder(this.uiState, name + '_total');

        const ret = new GameBuyable(name, displayName, visible, fn, args, currency, sellable);
        this.add(ret);
        this.setUIValue(ret);
        this.setUICost(ret);

        const currencyVar = this._items[currency];
        if (currencyVar instanceof GameCalculation) {
            currencyVar.fn = FunctionDefManager.adjust(currencyVar.fn, name + '_' + currency, (body) => body + ' - ' + fn.callStr(args).replace(name, name + '_total') + ' + ' + fn.callStrEvaluatedArgs(args)
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
        this._order.push(g.name);
        this._items[g.name] = g;
        this.setUIValue(g, "dirty");
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
        this.valueSetter(this.uiState, 't', t.time);
        this._dirty.push('t');

        const ran: string[] = [];

        this._order.forEach((name) => {
            if (this._dirty.includes(name)) {
                const dirtyVar = this._items[name];

                this.setUIValue(dirtyVar);
                this.setUICost(dirtyVar);
                this.setUISellCost(dirtyVar);

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
        if (!(buyable instanceof GameBuyable)) { return; }

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

    setFromUIValues(): void {

        this._order.forEach((varName) => {
            const gameVar = this._items[varName];
            if (gameVar instanceof GameBuyable) {
                gameVar.forceSetCounts(this.valueGetter(this.uiState, varName), this.valueGetter(this.uiState, varName + '_total'));
            } else if (gameVar instanceof GameTime) {
                gameVar.time = this.valueGetter(this.uiState, varName);
            }
            this._dirty.push(varName);
            setMathVariable(varName, this.valueGetter(this.uiState, varName));
        });
    }
}
