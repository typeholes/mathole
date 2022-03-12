import { GameAction } from "./GameAction";
import { GameMilestone } from "./GameMilestone";
import { GameState } from "./GameState";
import { UiStateWriter } from "./UiStateWriter";
import { ExtraMilestoneFields, RequiredVarFields, RequiredMilestoneFields, UiStateMethods } from "./GameVarManager";

import { getDependenciesFromString } from "./mathUtil";


export class GameMilestoneManager<M extends RequiredMilestoneFields, V extends RequiredVarFields> {
    private milestoneMap: { [any: string]: GameMilestone<V>} = {};
    private dependencies: { [any: string]: string[] } = {};
    private uiStateWriter: UiStateWriter<any,any,any>;

    create( name: string, displayName: string, condition: string, visible = false, rewardText = "", rewardAction: GameAction<V> = {}, extra: ExtraMilestoneFields<M> ) : GameMilestone<V> {
        this.uiStateWriter.addMilestone(name, extra);
        const milestone = new GameMilestone( name, displayName, condition, visible, rewardText, rewardAction );
        this.milestoneMap[name] = milestone;
        
        const deps = getDependenciesFromString(condition);
        deps.forEach( (dep) => {
            this.dependencies[dep] ||= [];
            this.dependencies[dep].push(name);
        });
        return milestone;
    }

    handleUpdate( varName: string ) : GameAction<V>[] {
        const deps = this.dependencies[varName];
        if (!deps) { return []; }   
        
        const actions : GameAction<V>[] = [];
        
        deps.forEach( (dep) => {
            if ( GameState.instance.milestoneReached( dep )) { return; }
            const milestone = this.milestoneMap[dep];
            if ( milestone.check() ) { 
                this.uiStateWriter.setReached(dep); 
                actions.push( milestone.rewardAction);
                const callbacks = GameState.instance.callbacks.milestoneReached;
                if ( callbacks ) { callbacks.forEach( (f) => f(milestone.name, milestone.rewardAction.storyPoint || "") ); }
            }
        })
        
        return actions;
    }

    getNames() : string[] {
        return Object.keys(this.milestoneMap);
    }
   
    get(name) : GameMilestone<V> {
        return this.milestoneMap[name];
    }

    constructor( uiStateWriter: UiStateWriter<any,any,any>) {
        this.uiStateWriter = uiStateWriter;
    }


}
