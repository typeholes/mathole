

import * as M from 'mathjs';
import { typeset } from './typeset';

import { addHandlers, createHovers } from './mathHovers';
import { plot } from './plot';

import {FunctionDef, FunctionDefManager} from './FunctionDef';
import { unique, defined } from './util';

export default displayExpr;
export { displayExpr,  runDefinition, runString, setVariable, M, expand, getDerivative, displayFunction, updateVar, getDependencies, getDependenciesFromString };

export type argMap = { [index: string]: string | number};

//simplify.rules.push({ l: 'n1*n2/(n1*n3)', r: 'n2/n3' });

export const parser = M.parser();

function setVariable(varName: string, value: string | number) {
  parser.set(varName, value);
}

function getDerivative(node: M.MathNode, by: string, args: argMap = {}) : M.MathNode {
  var expanded: M.MathNode = expand(node, true, args);
  var derived = M.derivative(expanded, by);
  return derived;
}

function expand(node: M.MathNode, replaceConstants: boolean, localScope: argMap = {}, maxDepth=Number.MAX_SAFE_INTEGER, depth=1) : M.MathNode {    

  if ( node.content) { // Parenthesis 
    node.content = expand(node.content, replaceConstants, localScope, maxDepth, depth+1);
    return node;
  }
  if (node.op && defined(node.args)) {  // OperatorNode2
    node.args = node.args.map( (a)=> {
      const newArg = expand(a, replaceConstants, localScope, maxDepth, depth+1) 
      return newArg;
    });     
    return node;
  }

  if (node.fn && defined(node.args) ) { // FunctionNode2 
    let def = FunctionDefManager.get(node.fn);
    if ( !defined(def) || depth > maxDepth ) { 
      node.args = node.args.map( (a)=> 
      expand(a, replaceConstants, localScope, maxDepth, depth) 
      );     
  
      return node; 
    } else {
      var bodyNode = M.parse(def.body);
      var bodyScope = {};
      for(var i=0;i<def.argNames.length;i++) {
        var argName = def.argNames[i];
        var argValue = node.args[i];
        bodyScope[argName] = expand(argValue, replaceConstants, { ...localScope }, maxDepth, depth+1);
      }
      var newNode=expand(bodyNode, replaceConstants, { ...localScope, ...bodyScope }, maxDepth, depth+1);
      return newNode;    
    }
    // todo: expand function def.
    return node;
  }

  if (node.name) { // SymbolNode2    
    const localValue = localScope[node.name];
    const value = replaceConstants ? localValue || parser.get(node.name) : localValue;
    if ( !defined(value) ) { 
      try {
        const result = node.evaluate();
        if ( typeof result === 'number') {
          return M.parse(result.toString()); // TODO: can I construct the ConstantNode directly?
        } else {
          return node;
        }
      } catch(err) {
        return node;
      }
    }
    if (typeof value == 'object') { 
      return value;     
    }

    return M.parse(value);
    
  }

  if (node.value) { // ConstantNode2 
    // no change for constants
    return node;
  }

  return node;
}

function updateVar(name: string, value: string | number) {
  parser.set(name, value); 
}

function runDefinition(str: string) { 
  var result = 'Valid';
  var fn = null;
//  try {
    fn = parser.evaluate(str); 
  // } catch(err) {
  //   result = err;
  // }
  return {result,fn};
}

function runString(str: string | number) { 
//  debugger;
  var result = 'Not Run';
  // try {
    result = parser.evaluate( (typeof str === 'string' ? str : str.toString())); 
  // } catch(err) {
  //   result = err;
  // }
  return result;
}

function texExpr(expr: string, doExpand: boolean, replaceConstants: boolean, args={}) {
  let parenthesis = 'keep';
  let implicit = 'hide';  

  return function() { 
    let node = M.parse(expr);
    let expanded = doExpand ? expand(node, replaceConstants, args) : node;
    let simplified = M.simplify(expanded)
    return simplified.transform(addHandlers).toTex({ parenthesis: parenthesis, implicit: implicit }); 
  };
}

function texDerivative(expr: string, selectedVar: string, args={}) {
  let parenthesis = 'keep';
  let implicit = 'hide';  
  return function() { 
    const node = M.parse(expr);
    let derivative = getDerivative(node, selectedVar, args);
    return derivative.transform(addHandlers).toTex({ parenthesis: parenthesis, implicit: implicit }); 
  };

}

function getDependencies(functionDef: FunctionDef, args = {}) : string[] {
  if (!functionDef) { return []; }
  return getDependenciesFromString( functionDef.body, args);
}

function getDependenciesFromString( expr: string, args = {} ) : string[] {
  const expanded = expand(M.parse(expr), false, args);
  
  const filtered = expanded.filter(function (node) {
    return node.isSymbolNode && defined(node.name) && defined(parser.get(node.name));
  });

  const dependencies = unique(filtered.map( (x) => x.name ?? ""));
  
  return dependencies;
  
}

function displayFunction(functionDef: FunctionDef, elementIdPrefix="", graphId="", graphTitle="", nameMap : {[any:string]: string}, args={}) {

  if ( defined(elementIdPrefix) && elementIdPrefix !== "") {
    displayExpr( functionDef.body, 'x', elementIdPrefix, args);
  }

  const expr = functionDef.body;
  const expanded = expand(M.parse(expr), true, args);
  
  const filtered = expanded.filter(function (node) {
    return node.isSymbolNode && defined(node.name) && defined(parser.get(node.name));
  });

  const freeVars = unique(filtered.map( (x) => x.name));
  if ( freeVars.length>1 ) {
    throw "too many free variables in " + functionDef.name + ": " + freeVars.join(', ')
  }
  
  const free = freeVars[0] ?? "t";

  const makeX = free === 'x' ? '' : free + '=x;';

  // plot(graphId, expanded.toString(), getDerivative(expanded, 'x', args).toString()); 
  plot(graphId, makeX+expanded.toString(), (nameMap[free]||free) + ' -> ' + graphTitle); 
    
}   

function displayExpr(expr: string, selectedVar: string, elementIdPrefix="", args={}) {


  const parts = [
    { id: elementIdPrefix + 'pretty',
      toTex: texExpr(expr, false, false),
    },
    { id: elementIdPrefix + 'pretty-val',
      toTex: texExpr(expr, true, false, args),
    },
    { id: elementIdPrefix + 'derivative',
      toTex: texDerivative(expr, selectedVar),      
    },
    { id: elementIdPrefix + 'derivative-val',
      toTex: texDerivative(expr, selectedVar, args),      
    },
  ];
  
  

  typeset(parts);

  


}


export function replaceSymbols(expr: string, replacements: {[any: string]: string}) {
  const node = M.parse(expr);
  const replaced = node.transform(function (node, path, parent) {
    if (node.isSymbolNode && defined(node.name) && replacements[node.name] ) {
      return M.parse( '"' + replacements[node.name] + '"');
    }
    else {
      return node
    }
  })
  return replaced.toString();
}