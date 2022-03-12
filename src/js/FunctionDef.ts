import { runDefinition as mathRunDefinition, runString } from "./mathUtil";
import { iskey } from "./util";

export type argMap = {[index: string]: string | number};

export class FunctionDef {
    readonly name: string;
    readonly argNames: string[];
    readonly body: string;
    private readonly _fn;

    constructor(name: string, argNames: string[], def: string) {
        this.name = name;
        this.argNames = argNames;
        this.body = def;
        
        this._fn = mathRunDefinition(this.defString()).fn;
    }

    evalArgValues(args: argMap) : (string|number)[] {
        return this.argNames.map( name => runString(args[name]));
    }

    argValues(args: argMap) : (string|number)[] {
        return this.argNames.map( name => args[name]);
    }

    public signatureString(): string {
        return this.name + '(' + this.argNames.join(',') + ')';
    }
    
    private defString() : string {
        return this.signatureString() + ' = ' + this.body;
    }


    run(args: argMap) : number {    
        return this._fn(...this.evalArgValues(args));
    }

    callStr(args: argMap) : string {
        return this.name + '(' + this.argValues(args).join(',') + ')';
    }

    callStrEvaluatedArgs(args: argMap) : string {
        return this.name + '(' + this.evalArgValues(args).join(',') + ')';
    }


}

const digitMap = {
        1: 'a',
        2: 'b',
        3: 'c',
        4: 'd',
        5: 'e',
        6: 'f',
        7: 'g',
        8: 'h',
        9: 'i',
        0: 'j',
        '.': 'k',
        '+': 'l',
        '-': 'm',
        ',': 'n',
        e: 'o'
    } as const;

export class FunctionDefManager {
    private static readonly _instance: FunctionDefManager = new FunctionDefManager();

    private map: {[any: string]: FunctionDef} = {};

    static add(fn: FunctionDef) {
        FunctionDefManager._instance.map[fn.name] = fn;
    }
    
    static get(name: string) : FunctionDef {
        return FunctionDefManager._instance.map[name];
    }

    static create(name: string, argNames: string[], def: string) : FunctionDef {
        const fn = new FunctionDef(name, argNames, def);
        FunctionDefManager.add(fn);
        return fn;
    }

    static adjust(fn: FunctionDef, newName: string, bodyModifier: (body: string) => string): FunctionDef {
        const ret = this.create(newName, fn.argNames, bodyModifier(fn.body));
        return ret;
    }
   
    private static uniqCnt=0;
       
    static makeUniqueSuffix() {
        this.uniqCnt++;
        const unique = this.uniqCnt.toString().split('').map( (c) => iskey(c, digitMap) ? digitMap[c] : "" ).join("");
        return unique + '_';
    }

    private constructor() {
    
        const fn = new FunctionDef('id', ['x'],'x');
        this.map.id = fn;
        
    }
}


