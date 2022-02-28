import { string } from "mathjs";
import { FunctionDefManager } from "./js/FunctionDef";

import { GameVarManager } from "./js/GameVar";

export class GameState<T> {
    canTick = true;

    // must be called before any other method
    static init<T>( uiState: T
        , varAdder: (uiState: T, name: string) => void
        , costGetter: (uiState: T, name: string) => number
        , costSetter: (uiState: T, name: string, cost: number) => void
        , valueGetter: (uiState: T, name: string) => number
        , valueSetter: (uiState: T, name: string, value: number) => number
        ): T { 


        GameState._instance = new GameState(uiState, varAdder, costGetter, costSetter, valueGetter, valueSetter);
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

    getCurrencyName(varName) : string {
        return this.gameVarManager.getCurrencyName(varName);
    }

    getCurrencyDisplayName(varName) : string {
        return this.getDisplayName(this.getCurrencyName(varName));
    }

    private static _instance: GameState<any>;

    private readonly gameVarManager: GameVarManager<T>;

    private readonly uiState: T;

    private readonly costGetter: (uiState: T, name: string) => number;
    private readonly valueGetter: (uiState: T, name: string) => number;

    private constructor
    ( uiState: T
    , varAdder: (uiState: T, name: string) => void
    , costGetter: (uiState: T, name: string) => number
    , costSetter: (uiState: T, name: string, cost: number) => void
    , valueGetter: (uiState: T, name: string) => number
    , valueSetter: (uiState: T, name: string, value: number) => number
    ) {
        this.uiState = uiState;
        this.costGetter = costGetter;
        this.valueGetter = valueGetter;

        this.gameVarManager = new GameVarManager<T>(
            uiState, varAdder, costGetter, costSetter, valueGetter, valueSetter
        );

        const vars = this.gameVarManager;
        vars.newCalculation( 'score', 'Score', false, times, {'x': 't', b:2} );
        vars.newBuyable( 'stability', 'Market Stability', true, times, {'x': 1.25, b: 'stability+1'}, 'score');
        vars.newBuyable( 'marketScale', 'Market Scale', true, times, {'x': 2, b: 'marketScale+1'}, 'stability');
        vars.newCalculation( 'smoother', 'Smoother', false, times, {x: 'stability', b: 0.01});
        vars.newCalculation('marketValue', 'Market Value', true, calcMarketValue, {x: 't'});
    }

}


const id = FunctionDefManager.create('id', ['x'],'x');
const times = FunctionDefManager.create('times', ['x','b'], 'x*b');
const reciprical = FunctionDefManager.create('reciprical', ['x'], '1/(x+1)');
const zigZag = FunctionDefManager.create('zigZag', ['x'], '1-2 * acos((1- smoother) * sin(2 * pi * x))/pi');
const squareWave = FunctionDefManager.create('squareWave', ['x'], '2 * atan( sin(2 * pi * x)/ smoother )/pi');
const sawtooth = FunctionDefManager.create('sawtooth', ['x'], '(1+zigZag((2 * x - 1)/4) * squareWave(x/2))/2');
const steps = FunctionDefManager.create('steps', ['x'], 'x - sawtooth(x)');
const logSquares = FunctionDefManager.create('logSquares', ['x','b'], 'log(x^2+b^2)');
const curvedSawtooth = FunctionDefManager.create('curvedSawtooth', ['x'], 'logSquares(x^smoother,sawtooth(x))');
const calcMarketValue = FunctionDefManager.create('calcMarketValue', ['x'], 'curvedSawtooth(x)*(marketScale+1)');



