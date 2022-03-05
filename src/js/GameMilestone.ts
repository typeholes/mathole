import { FunctionDef } from "./FunctionDef";
import { runString } from "./mathUtil";

export class GameMilestone {
    readonly name: string;
    readonly displayName: string;
    readonly rewardtext: string
    readonly condition: string; // to be evaluated by mathjs parser

    constructor( 
        name: string, 
        displayName: string,
        condition: string,
        rewardText: string = ""
        ) {
        this.name = name;
        this.displayName = displayName;
        this.rewardtext = rewardText;
        this.condition = condition;
    }
   
    check() : boolean {
        return runString(this.condition) as unknown as boolean; // let's just hope they use a boolean expr
    }
}