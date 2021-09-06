export type GameVar = { 
    __type: string;
    displayName: string;
    cntBought: number; 
    buyable: boolean;
    visible: boolean;
    costFn: string;
    costArgs: [any],
    valueFn: string,  
    valueArgs: [any],
}
export const GameVar__type = 'GameVar';

export function newGameVar(
    displayName: string,
    cntBought: number,
    buyable: boolean,
    visible: boolean,
    costFn: string,
    costArgs: [any],
    valueFn: string,  
    valueArgs: [any],  
) {
    return {
        displayName, cntBought, buyable, visible, costFn: costFn, costArgs, valueFn: valueFn, valueArgs
    }
}

export function getValue(gameVar: GameVar) {
//    console.log( gameVar.value);
    return fnMap[gameVar.valueFn](gameVar.cntBought, ...gameVar.valueArgs);
}

export function getCost(gameVar: GameVar) {
    //    console.log( gameVar.value);
        return fnMap[gameVar.costFn](gameVar.cntBought, ...gameVar.costArgs);
    }

// constant for fnMap keys 
export const fId = 'id';
export const fTimes = 'times';

export var fnMap = {
    [fId]: (cnt) => cnt,
    [fTimes]: (cnt, amt) => cnt * amt,
}
