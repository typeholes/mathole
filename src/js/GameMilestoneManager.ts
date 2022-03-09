import { GameMilestone } from "./GameMilestone";
import { GameState } from "./GameState";
import { ExtraMilestoneFields, MilestoneType, RequiredStateFields, UiStateMethods } from "./GameVarManager";

import { getDependenciesFromString } from "./mathUtil";

type MilestoneFlags = { [any:string]: boolean}
type MilestoneFnUpdaters = { [any:string]: {value?: string, cost?: string, sellCost?: string}}
export interface MilestoneRewardAction {
    setVisible?: MilestoneFlags;
    setBuyable?: MilestoneFlags;
    setSellable?: MilestoneFlags;
    adjustFunctions?: MilestoneFnUpdaters;
    storyPoint?: string;
}

export class GameMilestoneManager<T extends RequiredStateFields> {
    private milestoneMap: { [any: string]: GameMilestone} = {};
    private dependencies: { [any: string]: string[] } = {};

    create( name: string, displayName: string, condition: string, visible = false, rewardText = "", rewardAction: MilestoneRewardAction = {}, extra: ExtraMilestoneFields<MilestoneType<T>> ) : GameMilestone {
        this.uiStateMethods.milestoneAdder(this.uiState, name, extra);
        const milestone = new GameMilestone( name, displayName, condition, visible, rewardText, rewardAction );
        this.milestoneMap[name] = milestone;
        
        const deps = getDependenciesFromString(condition);
        deps.forEach( (dep) => {
            this.dependencies[dep] ||= [];
            this.dependencies[dep].push(name);
        });
        return milestone;
    }

    handleUpdate( varName: string ) : MilestoneRewardAction[] {
        const deps = this.dependencies[varName];
        if (!deps) { return []; }   
        
        const actions : MilestoneRewardAction[] = [];
        
        deps.forEach( (dep) => {
            if ( this.milestoneReached( dep )) { return; }
            const milestone = this.milestoneMap[dep];
            if ( milestone.check() ) { 
                this.setReached(dep); 
                actions.push( milestone.rewardAction);
                GameState.instance.callbacks.milestoneReached(milestone.name, milestone.rewardAction.storyPoint, milestone.visible);
            }
        })
        
        return actions;
    }


    private readonly uiState: T;
    private readonly uiStateMethods: UiStateMethods<T>;

    milestoneReached(name: string) : boolean {
        return this.uiStateMethods.milestoneGetter(this.uiState, name);
    }

    setReached(name:string) : void {
        this.uiStateMethods.milestoneSetter(this.uiState, name, true);
    }

    getNames() : string[] {
        return Object.keys(this.milestoneMap);
    }
   
    get(name) : GameMilestone {
        return this.milestoneMap[name];
    }

    loadReached(name: string, reached: boolean) {
        this.uiStateMethods.milestoneSetter(this.uiState, name, reached);
    }

    constructor(uiState: T, uiStateMethods: UiStateMethods<T>) {
        this.uiState = uiState;
        this.uiStateMethods = uiStateMethods;
    }


}
