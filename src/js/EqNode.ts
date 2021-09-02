export default
class EqNode {    
    static component = 'eq-node-view';
    component: string;
    
    constructor () {
        this.component = EqNode.component;
    }

    eqString() { return "eq node"; }

    valString(excludes: [string]) { return "eq node val"; } 

}
