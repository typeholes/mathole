import EqNode from  "./EqNode"

export default
class EqOp extends EqNode {
    static component = 'eq-op-view';
    
    left: EqNode;
    right: EqNode;
    op: string;
    component: string;

    constructor( left: EqNode, op:  string, right: EqNode ) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
        this.component = EqOp.component;
        
    }

    eqString() { return '(' + this.left.eqString() + ' ' + this.op + ' ' + this.right.eqString() + ')'; }

    valString(excludes: [string]) { return '(' + this.left.valString(excludes) + ' ' + this.op + ' ' + this.right.valString(excludes) + ')'; }

    replaceLeft(left: { left: EqNode; }) { return new EqOp ( left.left, this.op, this.right); }

}

