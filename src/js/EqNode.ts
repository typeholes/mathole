export default
class EqNode {
    static viewMap =  {};
    static component = 'eq-node-view';
    component: string;
    
    constructor () {
        this.component = EqNode.component;
    }

    eqString() { return "eq node"; }

    valString(excludes) { return "eq node val"; } 

    resolveView() {
        return EqNode.viewMap[this.component];
    }
}
