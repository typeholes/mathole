import { GameMilestone } from "./GameMilestone";
import { UiStateMethods } from "./GameVarManager";

import { runString, getDependenciesFromString } from "./mathUtil";

export class GameMilestoneManager<T> {

    private milestoneMap: { [any: string]: GameMilestone} = {};
    private dependencies: { [any: string]: string[] } = {};

    create( name: string, displayName: string, condition: string, rewardText = "" ) : GameMilestone {
        // TODO create conditions and adjusters.
        const milestone = new GameMilestone( name, displayName, condition, rewardText );
        this.milestoneMap[name] = milestone;
        
        const deps = getDependenciesFromString(condition);
        deps.forEach( (dep) => {
            this.dependencies[dep] ||= [];
            this.dependencies[dep].push(name);
        });
        return milestone;
    }

    handleUpdate( varName: string ) : void {
        const deps = this.dependencies[varName];
        if (!deps) { return; }    
        
        deps.forEach( (dep) => {
            if ( this.milestoneReached( dep )) { return; }
            const milestone = this.milestoneMap[dep];
            if ( milestone.check() ) { this.setReached(dep); };
        })
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
