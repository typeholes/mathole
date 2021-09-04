

export type EqEmpty = { __type: string }
export const EqEmpty__type = 'EqEmpty';

export type EqVar = { 
    displayName: string;
    varName: string;
    value: number;
    __type: string;
    buyable: boolean;
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

export function newEqVar(displayName: string, varName: string, value: number, buyable: boolean = true) {
    return { __type: EqVar__type,
        displayName: displayName, varName: varName, value: value, buyable: buyable
    }
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
        [EqOp__type]: (node: EqOp) => eqString(node.left) + ' ' + node.op + ' ' + eqString(node.right),        
    };
    if (!foo[node.__type]) { return "Not Found: " + node; }
    return foo[node.__type](node);
}
    


