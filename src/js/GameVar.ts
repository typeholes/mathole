import  setVariable  from './mathUtil';

import { runDefinition } from "./mathUtil";

export type GameVar = { 
    __type: string;
    name: string,
    displayName: string;
    cntBought: number; 
    buyable: boolean;
    visible: boolean;
    costFn: string;
    costArgs: [any],
    valueFn: string,  
    valueArgs: [any],
    costMathFunction: string | ((...args: any) => number),
    valueMathFunction: string | ((...args: any) => number),
}
export const GameVar__type = 'GameVar';

export function newGameVar(
    name: string,
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
        name, displayName, cntBought, buyable, visible, costFn: costFn, costArgs, valueFn: valueFn, valueArgs
    }
}

export function getValue(gameVar: GameVar) {
//    console.log( gameVar.value);
    if(!gameVar) return null;
    newFunction(gameVar, 'value');
    return typeof gameVar.valueMathFunction === 'function' ? gameVar.valueMathFunction(gameVar.cntBought) : 0;
}

function newFunction(gameVar: GameVar, fnType: string) {
    if (!gameVar[fnType + 'MathFunction'] || typeof (gameVar[fnType + 'MathFunction']) == "string") {
        var args = gameVar[fnType + 'Args'];
        var argStr = "";
        var cnt= 0;
        if (args.length>0) { argStr = ", " + args.join(','); }
        // args.forEach( () => {
        //     cnt++;
        //     argStr += ", arg" + cnt;
        // })
        
        const str = gameVar.name + '_' + fnType + '(cnt)=' + gameVar[fnType + 'Fn'] + '(cnt' + argStr + ')';
        console.log(str);
        var result = runDefinition(str);
        gameVar[fnType + 'MathFunction'] = result.result == "Valid" ? result.fn : result.result;
    }
}

export function getCost(gameVar: GameVar) {
    //    console.log( gameVar.value);
    if(!gameVar) return null;
    newFunction(gameVar, 'cost');
    return typeof gameVar.costMathFunction === 'function' ? gameVar.costMathFunction(gameVar.cntBought) : 0;
}

// constant for fnMap keys 
export const fId = 'id';
export const fTimes = 'times';

export var fnMap = {
    [fId]: (cnt) => cnt,
    [fTimes]: (cnt, amt) => cnt * amt,
}

export function setAll(varMap: {string: GameVar}) {
    Object.values(varMap).forEach( (gameVar) => setVariable(gameVar.name, getValue(gameVar)))
}