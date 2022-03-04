import { FunctionDef, FunctionDefManager } from "./FunctionDef";

import { GameVarManager } from "./GameVar";
import { displayFunction as mathDisplayFunction } from "./mathUtil";
import { SaveManager } from "./SaveManager";

export class GameState<T> {
    canTick = true;

    // must be called before any other method
    static init<T>( uiState: T
        , cloner: (uiState: T) => T
        , varAdder: (uiState: T, name: string) => void
        , costGetter: (uiState: T, name: string) => number
        , costSetter: (uiState: T, name: string, cost: number) => void
        , valueGetter: (uiState: T, name: string) => number
        , valueSetter: (uiState: T, name: string, value: number) => number
        , gameSetup: (vars: GameVarManager<T>, functions: typeof FunctionDefManager) => void
        ): T { 


        GameState._instance = new GameState(uiState, cloner, varAdder, costGetter, costSetter, valueGetter, valueSetter, gameSetup);
        return uiState;
    }

    // must call init first
    static getInstance<T>(): GameState<T> {
        return GameState._instance;
    }

    displayFunction(varName: string, graphTgt: string, nameMap : {[any:string]: string}, graphTitle: string): void {
        const gameVar = this.gameVarManager.get(varName);
        mathDisplayFunction(gameVar.fn,'', graphTgt, graphTitle, nameMap, gameVar.args);

    }

    getNameMap() {
        const ret = {};
        this.gameVarManager.getNames().forEach( (key) => 
            ret[key] = this.getDisplayName(key)
        );

        return ret;
    }

    getCost( name: string) : number {
        return this.costGetter(this.uiState, name);
    }

    getValue( name: string) : number {
        return this.valueGetter(this.uiState, name);
    }

    getNames() : string[] {
        return this.gameVarManager.getNames();
    }

    tick(elapsedTime: number) : void {
        if (this.canTick) {
            this.canTick = false;
            if (this.gameVarManager) {this.gameVarManager.tick(elapsedTime);}
            this.canTick = true;
        }
    }

    getDisplayName(varName: string) : string {
        if ( varName === "") { return "WTF!"; }
        return this.gameVarManager.get(varName).displayName; 
    } 

    isVisible(varName: string) :  boolean {
        return this.gameVarManager.get(varName).visible; 
    }

    buy(varName: string) : void {
        this.gameVarManager.buy(varName);
    }

    sell(varName: string) {
        this.gameVarManager.sell(varName);
    }

    isSellable(varName: string) : boolean {
        return this.gameVarManager.isSellable(varName);
    }

    isBuyable(varName: string) : boolean {
        return this.gameVarManager.isBuyable(varName);
    }

    getCurrencyName(varName: string) : string {
        return this.gameVarManager.getCurrencyName(varName);
    }

    getCurrencyDisplayName(varName: string) : string {
        if (varName === "") { return ""; }
        return this.getDisplayName(this.getCurrencyName(varName));
    }
    
    getDependencies(varName: string) : string[] {
        return this.gameVarManager.getDependencies(varName);
    }

    getDependents(varName: string) : string[] {
        
        return this.gameVarManager.getDependents(varName);
    }

    save() : void {
        this.canTick = false;
        this.saveManager.save('default');
        this.canTick = true;
    }

    // I'd like to use valueGetter and costGetter here, but newState doesn't have a value property
    // maybe need to pass in a from JSON callback as well?
    load() : void {
        this.canTick = false;
        const newState = this.saveManager.load('default');

        for (const key in newState) {
            const val = (newState[key] as any).value;
            const cost = (newState[key] as any).cost;
            this.valueSetter(this.uiState, key, val);
            this.costSetter(this.uiState, key, cost);
        }
        this.gameVarManager.setFromUIValues();
        this.canTick = true;
    }
    
    private static _instance: GameState<any>;
    
    private readonly gameVarManager: GameVarManager<T>;
    private readonly saveManager: SaveManager<T>;

    /**
     * description
     * 
     * @category uiState
     */
    private readonly uiState: T;

    /**
     * description
     * 
     * @category uiState
     */
    private readonly cloner: (uiState: T) => T;

    /**
     * description
     * 
     * @category uiState
     */
    private readonly costGetter: (uiState: T, name: string) => number;

    /**
     * description
     * 
     * @category uiState
     */
     private readonly valueGetter: (uiState: T, name: string) => number;

    /**
     * description
     * 
     * @category uiState
     */
     private readonly costSetter: (uiState: T, name: string, cost: number) => void;

    /**
     * description
     * 
     * @category uiState
     */
     private readonly valueSetter: (uiState: T, name: string, value: number) => number;


    private constructor
    ( uiState: T
    , cloner: (uiState: T) => T
    , varAdder: (uiState: T, name: string) => void
    , costGetter: (uiState: T, name: string) => number
    , costSetter: (uiState: T, name: string, cost: number) => void
    , valueGetter: (uiState: T, name: string) => number
    , valueSetter: (uiState: T, name: string, value: number) => number
    , gameSetup: (vars: GameVarManager<T>, functions: typeof FunctionDefManager) => void
    ) {
        this.uiState = uiState;
        this.cloner = cloner;
        this.costGetter = costGetter;
        this.valueGetter = valueGetter;
        this.costSetter = costSetter;
        this.valueSetter = valueSetter;

        this.gameVarManager = new GameVarManager<T>(
            uiState, varAdder, costGetter, costSetter, valueGetter, valueSetter
        );

        const vars = this.gameVarManager;

        gameSetup(vars, FunctionDefManager);

        this.saveManager = new SaveManager( () => this.cloner(this.uiState) );
    }



}



