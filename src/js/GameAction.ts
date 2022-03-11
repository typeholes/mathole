
import { ExtraVarFields, RequiredVarFields } from './GameVarManager';

type MilestoneFlags = { [any:string]: boolean}
type MilestoneFnUpdaters = { [any:string]: {value?: string, cost?: string, sellCost?: string}}

export interface GameAction<V extends RequiredVarFields> { 
    setUiFields?: {[any: string]: ExtraVarFields<V>} ;
    setBuyable?: MilestoneFlags;
    setSellable?: MilestoneFlags;
    adjustFunctions?: MilestoneFnUpdaters;
    storyPoint?: string;
}

export const NoGameAction : GameAction<any> = {};