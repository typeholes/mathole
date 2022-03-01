import { FunctionDefManager } from "./FunctionDef";

import { GameVarManager } from "./GameVar";
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
        return this.gameVarManager.get(varName).displayName; 
    } 

    isVisible(varName: string) :  boolean {
        return this.gameVarManager.get(varName).visible; 
    }

    buy(varName: string) : void {
        this.gameVarManager.buy(varName);
    }

    isBuyable(varName: string) : boolean {
        return this.gameVarManager.isBuyable(varName);
    }

    getCurrencyName(varName: string) : string {
        return this.gameVarManager.getCurrencyName(varName);
    }

    getCurrencyDisplayName(varName: string) : string {
        return this.getDisplayName(this.getCurrencyName(varName));
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

    private readonly uiState: T;

    private readonly cloner: (uiState: T) => T;
    private readonly costGetter: (uiState: T, name: string) => number;
    private readonly valueGetter: (uiState: T, name: string) => number;
    private readonly costSetter: (uiState: T, name: string, cost: number) => void;
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



