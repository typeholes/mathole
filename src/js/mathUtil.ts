

import * as M from 'mathjs';
import { typeset } from './typeset';

import { addHandlers, createHovers } from './mathHovers';
import { plot } from './plot';

import {FunctionDef, FunctionDefManager} from './FunctionDef';
import { isInteger } from 'mathjs';
import { unique } from './util';

export default displayExpr;
export { displayExpr,  runDefinition, runString, setVariable, M, expand, getDerivative, displayFunction, updateVar, getDependencies };

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

function expand(node: M.MathNode, replaceConstants: boolean, localScope: argMap = {}, maxDepth=Number.MAX_SAFE_INTEGER, depth=1) {    

  if ( node.content) { // Parenthesis 
    node.content = expand(node.content, replaceConstants, localScope, maxDepth, depth+1);
    return node;
  }
  if (node.op) {  // OperatorNode2
    node.args = node.args.map( (a)=> 
      expand(a, replaceConstants, localScope, maxDepth, depth+1) 
      );     
    return node;
  }

  if (node.fn) { // FunctionNode2 
    let def = FunctionDefManager.get(node.fn);
    if (typeof def == 'undefined' || depth > maxDepth) { 
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
    if (typeof value == 'undefined') { 
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

}

function updateVar(name: string, value: string | number) {
  parser.set(name, value); 
}

function runDefinition(str) { 
  var result = 'Valid';
  var fn = null;
  try {
    fn = parser.evaluate(str); 
  } catch(err) {
    result = err;
  }
  return {result,fn};
}

function runString(str) { 
//  debugger;
  var result = 'Not Run';
  try {
    result = parser.evaluate(str); 
  } catch(err) {
    result = err;
  }
  return result;
}

function texExpr(expr, doExpand, replaceConstants, args={}) {
  let parenthesis = 'keep';
  let implicit = 'hide';  

  return function() { 
    let node = M.parse(expr);
    let expanded = doExpand ? expand(node, replaceConstants, args) : node;
    let simplified = M.simplify(expanded)
    return simplified.transform(addHandlers).toTex({ parenthesis: parenthesis, implicit: implicit }); 
  };
}

function texDerivative(expr, selectedVar, args={}) {
  let parenthesis = 'keep';
  let implicit = 'hide';  
  return function() { 
    let derivative = getDerivative(expr, selectedVar, args);
    return derivative.transform(addHandlers).toTex({ parenthesis: parenthesis, implicit: implicit }); 
  };

}

function getDependencies(functionDef: FunctionDef, args) : string[] {
  if (!functionDef) { return []; }
  
  const expr = functionDef.body;
  const expanded = expand(M.parse(expr), false, args);
  
  const filtered = expanded.filter(function (node) {
    return node.isSymbolNode && typeof parser.get(node.name) !== 'undefined'
  });

  const dependencies = unique(filtered.map( (x) => x.name));
  
  return dependencies;
  
}

function displayFunction(functionDef: FunctionDef, elementIdPrefix="", graphId="", graphTitle="", nameMap : {[any:string]: string}, args={}) {

  if ( typeof elementIdPrefix !== 'undefined' && elementIdPrefix !== "") {
    displayExpr( functionDef.body, 'x', elementIdPrefix, args);
  }

  const expr = functionDef.body;
  const expanded = expand(M.parse(expr), true, args);
  
  const filtered = expanded.filter(function (node) {
    return node.isSymbolNode && typeof parser.get(node.name) !== 'undefined'
  });

  const freeVars = unique(filtered.map( (x) => x.name));
  if ( freeVars.length>1 ) {
    throw "too many free variables in " + functionDef.name + ": " + freeVars.join(', ')
  }
  
  const free = freeVars[0];

  const makeX = free === 'x' ? '' : free + '=x;';

  // plot(graphId, expanded.toString(), getDerivative(expanded, 'x', args).toString()); 
  plot(graphId, makeX+expanded.toString(), (nameMap[free]||free) + ' -> ' + graphTitle); 
    
}   

function displayExpr(expr, selectedVar, elementIdPrefix="", args={}) {


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


