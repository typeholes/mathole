import { GameVar as GameVarT } from  "./GameVar"
import * as GameVar from "./GameVar";


export type EqEmpty = { __type: string }
export const EqEmpty__type = 'EqEmpty';


export type EqVar = {     
    __type: string;
    varName: string;
}
export const EqVar__type = 'EqVar';

export type EqOp = {
    left: EqNode;
    right: EqNode;
    op: string;
    __type: string;
}
export const EqOp__type = 'EqOp';

export type EqNode = EqEmpty | EqVar | EqOp

export function newEqEmpty() {
    return { __type: EqEmpty__type 
    };
}

export function newEqVar(varName: string) {
    return { __type: EqVar__type, varName, };
}

export function newEqOp(left: EqNode, op:  string, right: EqNode) {
    return { __type: EqOp__type,
        left: left, op: op, right: right
    }
}

export function eqString(node : EqNode) : string  { 
    var foo = { 
        [EqEmpty__type]: (node: EqEmpty) => 'empty',
        [EqVar__type]: (node: EqVar) => node.varName,
        [EqOp__type]: (node: EqOp) => '( ' + eqString(node.left) + ' ' + node.op + ' ' + eqString(node.right) + ')' ,        
    };
    if (!foo[node.__type]) { return "Not Found: " + node; }
    return foo[node.__type](node);
}
    
export function valString(node : EqNode, varMap: {String: GameVarT}, excludes: String[]) : string  { 
    var foo = { 
        [EqEmpty__type]: (node: EqEmpty) => '0',
        [EqVar__type]: (node: EqVar) => excludes.includes(node.varName) ? node.varName : GameVar.getValue(varMap[node.varName]).toString(),
        [EqOp__type]: (node: EqOp) => '( ' + valString(node.left, varMap, excludes) + ' ' + node.op + ' ' + valString(node.right, varMap, excludes) + ')',        
    };
    if (!foo[node.__type]) { return "Not Found: " + node; }
    return foo[node.__type](node);
}



