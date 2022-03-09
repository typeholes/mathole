import { FunctionDef } from "./FunctionDef";
import { MilestoneRewardAction } from "./GameMilestoneManager";
import { runString } from "./mathUtil";

export class GameMilestone {
    readonly name: string;
    readonly displayName: string;
    readonly rewardtext: string
    readonly condition: string; // to be evaluated by mathjs parser
    readonly rewardAction: MilestoneRewardAction;
    readonly visible: boolean;

    constructor( 
        name: string, 
        displayName: string,
        condition: string,
        visible: boolean,
        rewardText: string = "",
        rewardAction: MilestoneRewardAction = {}
        ) {
        this.name = name;
        this.displayName = displayName;
        this.rewardtext = rewardText;
        this.condition = condition;
        this.rewardAction = rewardAction;
    }
   
    check() : boolean {
        return runString(this.condition) as unknown as boolean; // let's just hope they use a boolean expr
    }
}