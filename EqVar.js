class EqVar {
    constructor(displayName, varName, value) {
        this.displayName=displayName;
        this.varName=varName;
        this.value=value;
        this.component="eq-var";
        this.handler=function() { console.log(displayName); }
    }
}

class EqOp {
    constructor( left, op, right ) {
        this.left = left;
        this.right = right;
        this.op = op;
        this.component = "eq-op";
        this.handler=function() { console.log(op); }
    }
}