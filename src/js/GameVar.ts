
export type GameVar = { 
    __type: string;
    displayName: string;
    cntBought: number; 
    buyable: boolean;
    visible: boolean;
    cost: string;
    value: string;    
}
export const GameVar__type = 'GameVar';

export function newGameVar(
    displayName: string,
    cntBought: number,
    buyable: boolean,
    visible: boolean,
    cost: string,
    value: string,    
) {
    return {
        displayName, cntBought, buyable, visible, cost, value,    
    }
}

export function getValue(gameVar: GameVar) {
//    console.log( gameVar.value);
    return fnMap[gameVar.value](gameVar.cntBought);
}

// constant for fnMap keys 
export const fId = 'id';

export var fnMap = {
    [fId]: (cnt) => cnt
}
