import { FunctionDef } from "./FunctionDef";

export class GameMilestone {
    readonly varName: string;
    readonly value: number;
    readonly displayName: string;
    readonly rewardtext: string

    constructor( 
        varName: string, 
        value: number, 
        displayName: string,
        rewardText: string = ""
        ) {
        this.varName = varName;
        this.value = value;
        this.displayName = displayName;
        this.rewardtext = rewardText;
    }
    
}