import EqNode from  "./EqNode"



export default
class EqVar  extends EqNode {
    static component = 'eq-var-view';

    displayName: string;
    varName: string;
    value: number;
    component: string;

    constructor(displayName: string, varName: string, value: number) {
        super();
        this.displayName=displayName;
        this.varName=varName;
        this.value=value;        
        this.component = EqVar.component;
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
