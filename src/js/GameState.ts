import { FunctionDefManager } from "./FunctionDef";

import { ExtraVarFields, GameVarManager, RequiredMilestoneFields, RequiredStateFields, RequiredVarFields, UiStateMethods } from "./GameVarManager";
import { displayFunction as mathDisplayFunction } from "./mathUtil";
import { SaveManager } from "./SaveManager";
import { GameMilestoneManager } from "./GameMilestoneManager";
import { Action } from "./TickBuffer";
import { UiStateWriter } from "./UiStateWriter";

export type EngineCallbackMap = {
    milestoneReached?: ((milestoneName: string, storyPoint: string) => void)[]
}

function ignore(...args: any[]) : void {}

export class GameState<S extends RequiredStateFields<V,M>, V extends RequiredVarFields, M extends RequiredMilestoneFields> {
    // must be called before any other method
    static init<S extends RequiredStateFields<V,M>, V extends RequiredVarFields, M extends RequiredMilestoneFields>( 
        uiState: S
        , uiStateMethods: UiStateMethods<S,V,M>
        , defaultVarExtra: ExtraVarFields<V>
        , gameSetup: (vars: GameVarManager<S,V,M>, functions: typeof FunctionDefManager, milestones: GameMilestoneManager<M,V>) => void
        , callbacks: EngineCallbackMap
        ): S { 

        GameState._instance = new GameState(uiState, uiStateMethods, defaultVarExtra, gameSetup, callbacks);
        return uiState;
    }

    // must call init first
    static getInstance<S extends RequiredStateFields<V,M>, V extends RequiredVarFields, M extends RequiredMilestoneFields >(): GameState<S,V,M> {
        return GameState._instance;
    }

    canTick = false;
    
    callbacks: EngineCallbackMap;

    private hasStarted = false;
    start() {
        if (!this.hasStarted) {
            this.hasStarted = true;
            this.canTick = true;
        }
    }

    asap(...actions: Action[]) : void { this.gameVarManager.asap(...actions) };
    schedule(action: Action, waitAfter=0, minWait=0) : void { this.gameVarManager.schedule(action, waitAfter, minWait) };

    displayFunction(varName: string, graphTgt: string, nameMap : {[any:string]: string}, graphTitle: string): void {
        const gameVar = this.gameVarManager.get(varName);
        mathDisplayFunction(gameVar.fn,'', graphTgt, graphTitle, nameMap, gameVar.args);

    }

    milestoneReached(milestoneName: string) : boolean {
        return this.uiStateMethods.milestoneGetter(this.uiState, milestoneName );
    }

    getNameMap() {
        const ret = {};
        this.gameVarManager.getNames().forEach( (key) => 
            ret[key] = this.getDisplayName(key)
        );

        return ret;
    }

    getNames( filter: false | ((varField: V) => boolean) = false) : string[] {
        if (!filter) { 
            return this.gameVarManager.getNames();
        } else {
            const varFilter = filter;
            const filtered = this.gameVarManager.getNames().filter( (name) => {
                const item = this.uiState.vars[name];
                return filter(item);
            });
            return filtered;
        }
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
    
    isToggle(varName: string) : boolean {
        return this.gameVarManager.isToggle(varName);
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

    getMilestoneNames(): string[]{
        return this.milestoneManager.getNames();
    }
  
    getMilestoneDisplayName(name: string) : string {
        if (!name) { return ''};
        return this.milestoneManager.get(name).displayName;
    }

    getMilestoneReward(name: string) : string {
        if (!name) { return ''};
        return this.milestoneManager.get(name).rewardtext;
    }

    getMilestoneCondition(name: string) : string {
        if (!name) { return ''};
        
         const cond = this.milestoneManager.get(name).condition;
        const ret = this.getDisplayExpr(cond);
        return ret;
    }

    getDisplayExpr(expr: string) : string {
        return this.gameVarManager.getDisplayExpr(expr);
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
        const newVars = newState['vars'];
        const newMilestones = newState['milestones'];
        
        this.gameVarManager.getNames().forEach( (name) => {
            const values = newVars[name] || { value: 0, cost: 0, sellCost: 0, total: 0};
            const val = values.value;
            const cost = values.cost;
            const sellCost = values.cost;
            const total = values.total;
            this.gameVarManager.setRequiredVarField(name, 'value', val);
            this.gameVarManager.setRequiredVarField(name, 'cost', cost);
            this.gameVarManager.setRequiredVarField(name, 'sellCost', sellCost);
            this.gameVarManager.setRequiredVarField(name, 'total', total);
        });
        
        this.milestoneManager.getNames().forEach( (name) => {
            this.uiStateWriter.loadReached(name, (newMilestones[name]||{reached: false}).reached);
        });

        this.gameVarManager.setFromUIValues();
        this.canTick = true;
    }
    
    private static _instance: GameState<any,any,any>;
    static get instance() { return GameState._instance; }
    
    private readonly gameVarManager: GameVarManager<S,V,M>;
    private readonly saveManager: SaveManager<S>;
    private readonly milestoneManager: GameMilestoneManager<M,V>;

    /**
     * description
     * 
     * @category uiState
     */
    protected readonly uiState: S;
    protected readonly uiStateMethods: UiStateMethods<S,V,M>;
    private readonly uiStateWriter : UiStateWriter<S,V,M>;

    protected constructor
    ( uiState: S
    , uiStateMethods: UiStateMethods<S,V,M>
    , defaultVarExtra: ExtraVarFields<V>
    , gameSetup: (vars: GameVarManager<S,V,M>, functions: typeof FunctionDefManager, milestones: GameMilestoneManager<M,V>) => void
    , callbacks: EngineCallbackMap
    ) {
        this.uiState = uiState;
        this.uiStateMethods = uiStateMethods;
        this.callbacks = callbacks;
        
        for(let key in callbacks) {
            this.callbacks[key] ||= ignore;
        }

        this.uiStateWriter = new UiStateWriter(uiState, uiStateMethods);
        this.milestoneManager = new GameMilestoneManager<M,V>(this.uiStateWriter);

        this.gameVarManager = new GameVarManager<S,V,M>(
            this.uiStateWriter, defaultVarExtra, this.milestoneManager
        );

        gameSetup(this.gameVarManager, FunctionDefManager, this.milestoneManager);

       this.saveManager = new SaveManager( () => this.uiStateMethods.cloner(this.uiState) );
        
    }

}


