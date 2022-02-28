

import * as M from 'mathjs';
import { typeset } from './typeset';

import { addHandlers, createHovers } from './mathHovers';
import { plot } from './plot';

import {FunctionDef, FunctionDefManager} from './FunctionDef';

export default displayExpr;
export { displayExpr,  runDefinition, runString, setVariable, M, expand, getDerivative, displayFunction, updateVar };

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

function expand(node: M.MathNode, replaceConstants: boolean, localScope: argMap = {}) {    

  if ( node.content) { // Parenthesis 
    node.content = expand(node.content, replaceConstants, localScope);
    return node;
  }
  if (node.op) {  // OperatorNode2
    node.args = node.args.map( (a)=> 
      expand(a, replaceConstants, localScope) 
      );     
    return node;
  }

  if (node.fn) { // FunctionNode2 
    let def = FunctionDefManager.get(node.fn);
    if (typeof def == 'undefined') { 
      node.args = node.args.map( (a)=> 
      expand(a, replaceConstants, localScope) 
      );     
  
      return node; 
    } else {
      var bodyNode = M.parse(def.body);
      var bodyScope = {};
      for(var i=0;i<def.argNames.length;i++) {
        var argName = def.argNames[i];
        var argValue = node.args[i];
        bodyScope[argName] = expand(argValue, replaceConstants, { ...localScope, ...bodyScope });
      }
      var newNode=expand(bodyNode, replaceConstants, { ...localScope, ...bodyScope });
      return newNode;    
    }
    // todo: expand function def.
    return node;
  }

  if (node.name) { // SymbolNode2    
    const value = localScope[node.name] || parser.get(node.name);
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

function displayFunction(functionDef: FunctionDef, elementIdPrefix="", graphId="", args={}) {

  if ( typeof elementIdPrefix !== 'undefined' && elementIdPrefix !== "") {
    displayExpr( functionDef.body, 'x', elementIdPrefix, args);
  }

  const expr = functionDef.body;
  const expanded = expand(M.parse(expr), true, args);
  // plot(graphId, expanded.toString(), getDerivative(expanded, 'x', args).toString()); 
  plot(graphId, expanded.toString(), "TODO"); 
    
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


