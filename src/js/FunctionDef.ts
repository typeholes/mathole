import { runDefinition as mathRunDefinition } from "./mathUtil";
export type FunctionDef = {
    name: string,
    builtin: boolean,
    args: string[],
    def: string,
}

export function newFunctionDef(name: string, builtin: boolean, args: string[], def: string) : FunctionDef {
    return { name, builtin, args, def };
}

export function defString(def: FunctionDef) : string {
    if (def.builtin) return "";
    return def.name + '(' + def.args.join(',') + ') = ' + def.def;
}


export function runDefinition(def: FunctionDef) : string {    
    if (!def || def.builtin || def.args.length < 1 || !(def.def).trim() ) return;
    const result = mathRunDefinition(defString(def)).result;
    return result;
  }

