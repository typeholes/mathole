

export type EqEmpty = { __type: string }
export const EqEmpty__type = 'EqEmpty';

// need to move at least the mutable properties out of the type and into a list of seperate objects in the vuex state
// may be best to move everything but index and __type

export type EqVar = { 
    index: number,
    displayName: string;
    varName: string;
    value: number; // Mutable, so always get from varList[index] as local value may not be in sync.
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

export function newEqVar(index: number, displayName: string, varName: string, value: number, buyable: boolean = true) {
    return { __type: EqVar__type,
        index: index, displayName: displayName, varName: varName, value: value, buyable: buyable
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
    
export function valString(node : EqNode, varList: EqVar[], excludes: String[]) : string  { 
    var foo = { 
        [EqEmpty__type]: (node: EqEmpty) => '0',
        [EqVar__type]: (node: EqVar) => excludes.includes(node.varName) ? node.varName : varList[node.index].value.toString(),
        [EqOp__type]: (node: EqOp) => valString(node.left, varList, excludes) + ' ' + node.op + ' ' + valString(node.right, varList, excludes),        
    };
    if (!foo[node.__type]) { return "Not Found: " + node; }
    return foo[node.__type](node);
}



