import { ref, provide, inject, Ref } from "vue";


export type clickActionsT= { dependencies: boolean; dependents: boolean; graph: boolean; sticky: boolean; };

export enum PropKeys {
    ClickAction = "clickAction",
    GraphedVarName = "graphedVarName", 
    SelectedVarName = "selectedVarName",
    Dependencies = "dependencies",
    Dependents = "dependents",
    ClickActions = "clickActions"
}

export function provides( ...kvPairs: [key: PropKeys, value : any ][] ) : {[any: string]: Ref<any>} {
    const ret = {};
    kvPairs.forEach( ([key, value]) => {
    const rValue = ref(value);
    provide(key, ()=>rValue);
    ret[key] = rValue;
    });
    
    return ret;
}

export function injects( ...keys : PropKeys[]) : {[any: string]: any} {
    const ret = {};

    keys.forEach( (k) => ret[k] = inject<()=>any>(k)());
    return ret;
}
