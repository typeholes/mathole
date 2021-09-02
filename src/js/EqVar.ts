import EqNode from  "./EqNode"



export default
class EqVar  extends EqNode {
    static component = 'eq-var-view';

    displayName: string;
    varName: string;
    value: number;
    component: string;
    buyable: boolean;

    constructor(displayName: string, varName: string, value: number, buyable: boolean = true) {
        super();
        this.displayName=displayName;
        this.varName=varName;
        this.value=value;        
        this.component = EqVar.component;
        this.buyable = buyable;
    }

    eqString() { return this.varName; }

    valString(excludes: [string]) { 
        if ( excludes.includes(this.varName)) {
            return this.varName; 
        } else {
            return this.value.toString();
        }
    }

    clone() {
        return new EqVar(this.displayName, this.varName, this.value, this.buyable);
    }
}
