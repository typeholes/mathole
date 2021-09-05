import { atomicMassDependencies } from "mathjs";

export type GameVar = { 
    __type: string;
    displayName: string;
    cntBought: number; 
    buyable: boolean;
    visible: boolean;
    cost: string;
    costArgs: [any],
    value: string,  
    valueArgs: [any],
}
export const GameVar__type = 'GameVar';

export function newGameVar(
    displayName: string,
    cntBought: number,
    buyable: boolean,
    visible: boolean,
    cost: string,
    costArgs: [any],
    value: string,  
    valueArgs: [any],  
) {
    return {
        displayName, cntBought, buyable, visible, cost, costArgs, value, valueArgs
    }
}

export function getValue(gameVar: GameVar) {
//    console.log( gameVar.value);
    return fnMap[gameVar.value](gameVar.cntBought, ...gameVar.valueArgs);
}

export function getCost(gameVar: GameVar) {
    //    console.log( gameVar.value);
        return fnMap[gameVar.cost](gameVar.cntBought, ...gameVar.costArgs);
    }

// constant for fnMap keys 
export const fId = 'id';
export const fTimes = 'times';

export var fnMap = {
    [fId]: (cnt) => cnt,
    [fTimes]: (cnt, amt) => cnt * amt,
}
