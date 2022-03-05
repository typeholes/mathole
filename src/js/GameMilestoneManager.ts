import { GameMilestone } from "./GameMilestone";
import { GameVarManager, UiStateMethods } from "./GameVarManager";

import { runString, getDependenciesFromString } from "./mathUtil";

type MilestoneFlags = { [any:string]: boolean}
type MilestoneFnUpdaters = { [any:string]: string}
export interface MilestoneRewardAction {
    setVisible?: MilestoneFlags;
    setBuyable?: MilestoneFlags;
    setSellable?: MilestoneFlags;
    adjustValue?: MilestoneFnUpdaters;
    adjustCost?: MilestoneFnUpdaters;
    adjustSellCost?: MilestoneFnUpdaters;
}

export class GameMilestoneManager<T> {

    private milestoneMap: { [any: string]: GameMilestone} = {};
    private dependencies: { [any: string]: string[] } = {};

    create( name: string, displayName: string, condition: string, rewardText = "", rewardAction: MilestoneRewardAction = {} ) : GameMilestone {
        // TODO create conditions and adjusters.
        const milestone = new GameMilestone( name, displayName, condition, rewardText, rewardAction );
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

    constructor(uiState: T, uiStateMethods: UiStateMethods<T>) {
        this.uiState = uiState;
        this.uiStateMethods = uiStateMethods;
    }


}
