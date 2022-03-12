import { RequiredVarFields} from "./GameVarManager";
import { GameAction } from "./GameAction";
import { runString } from "./mathUtil";

export class GameMilestone<V extends RequiredVarFields> {
    readonly name: string;
    readonly displayName: string;
    readonly rewardtext: string
    readonly condition: string; // to be evaluated by mathjs parser
    readonly rewardAction: GameAction<V>;

    constructor( 
        name: string, 
        displayName: string,
        condition: string,
        visible: boolean,
        rewardText: string = "",
        rewardAction: GameAction<V> = {}
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