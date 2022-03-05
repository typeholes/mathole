import { ref, Ref, provide, inject, reactive } from "vue";
import { UiVarFields, UiStateMethods, defaultUiVarFields } from "../js/GameVarManager";


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

export type UiVar = UiVarFields;
export type UiState = { [any: string]: UiVar };
export const uiState: UiState = reactive( {} );

export const uiStateMethods : UiStateMethods<UiState> = {
    cloner: (m) => m,
    varAdder: (m,n) => m[n] = reactive({...defaultUiVarFields}),
    varGetter: (m,n,k) => m[n][k],
    varSetter: (m,n,k,v) => m[n][k]= v 
}
