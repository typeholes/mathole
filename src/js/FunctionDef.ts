import { runDefinition as mathRunDefinition, addFunction } from "./mathUtil";
export type FunctionDef = {
    name: string,
    builtin: boolean,
    args: string[],
    argValues: string[],
    def: string,
}

export function newFunctionDef(name: string, builtin: boolean, args: string[], argValues: string[], def: string) : FunctionDef {
    let vals = argValues || args.map( (x)=>'1');
    if (!builtin) {
        addFunction( name, args, vals, def);
    }
    return { name, builtin, args, argValues: vals, def };
}

export function fromBuiltin(name: string) {
    return { [name]: newFunctionDef(name, true, ['x'], ['x'], '') };
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

