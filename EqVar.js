class EqVar {
    constructor(displayName, varName, value) {
        this.displayName=displayName;
        this.varName=varName;
        this.value=value;
        this.component="eq-var";
        this.handler=function() { console.log(displayName); }
    }

    eqString() { return this.varName; }

    valString(excludes) { 
        if ( excludes.includes(this.varName)) {
            return this.varName; 
        } else {
            return this.value.toString();
        }
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

    eqString() { return '(' + this.left.eqString() + ' ' + this.op + ' ' + this.right.eqString() + ')'; }

    valString(excludes) { return '(' + this.left.valString(excludes) + ' ' + this.op + ' ' + this.right.valString(excludes) + ')'; }

}