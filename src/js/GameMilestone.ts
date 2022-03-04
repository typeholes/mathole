import { FunctionDef } from "./FunctionDef";

export class GameMilestone {
    readonly varName: string;
    readonly value: number;
    readonly affectsVarName: string;
    readonly fn: FunctionDef;

    constructor( varName: string, value: number, affectsVarName: string, fn: FunctionDef) {
        this.varName = varName;
        this.value = value;
        this.affectsVarName = affectsVarName;
        this.fn = fn;
    }
    
}