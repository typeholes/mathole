import { ExtraMilestoneFields, ExtraVarFields, RequiredMilestoneFields, RequiredStateFields, RequiredVarFields, UiStateMethods } from "./GameVarManager";


export class UiStateWriter<S extends RequiredStateFields<V, M>, V extends RequiredVarFields, M extends RequiredMilestoneFields> {
    protected uiState: S;
    protected readonly uiStateMethods: UiStateMethods<S, V, M>;

    constructor(uiState: S, uiStateMethods: UiStateMethods<S, V, M>) {
        this.uiState = uiState;
        this.uiStateMethods = uiStateMethods;
    }

    setReached(name: string): void {
        this.uiStateMethods.milestoneSetter(this.uiState, name, true);
    }

    addVar(name: string, extra: ExtraVarFields<V>) {
        this.uiStateMethods.varAdder(this.uiState, name, extra);
    }

    addMilestone(name: string, extra: ExtraMilestoneFields<M>) {
        this.uiStateMethods.milestoneAdder(this.uiState, name, extra);
    }

    loadReached(name: string, reached: boolean) {
        this.uiStateMethods.milestoneSetter(this.uiState, name, reached);
        // TODO: Do I need to trigger handleAction here?
    }

    getVarField(name: string, field: keyof V): number {
        return this.uiStateMethods.varGetter(this.uiState, name, field);
    }

    setVarField(name: string, field: keyof V, val: number) {
        this.uiStateMethods.varSetter(this.uiState, name, field, val);
    }

    setVarFields(name: string, fields: V) {
        for( let field in fields) {
            this.uiStateMethods.varSetter(this.uiState, name, field, fields[field]);
        }
    }
}
