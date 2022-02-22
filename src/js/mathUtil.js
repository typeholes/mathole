import {simplify, derivative, compile, parser as mkParser, parse as mathParse, exp} from 'mathjs';

import * as M from 'mathjs';

import * as Eq from './Eq';
import * as GameVar from './GameVar';

import { addHandlers, createHovers } from './mathHovers';
import { plot } from './plot';

export default displayExpr;
export { displayExpr, evalEquation, runDefinition, runString, setVariable, addFunction, M, expand, formatGraphExpr, getDerivative, displayFunction };


//simplify.rules.push({ l: 'n1*n2/(n1*n3)', r: 'n2/n3' });

const parser = mkParser();

function setVariable(varName, value) {
  parser.set(varName, value);
}

var functionDefs = {}
function addFunction(name, args, argValues, body) {
  functionDefs[name] = { name, args, argValues, body, valid: false}
  var fnString = name + '(' + args.join(',') + ')=' + body;
  var { result, fn } = runDefinition(fnString);
  functionDefs[name].valid = result=='Valid';    
  return {result, fn};
}


function getDerivative(expr, by, args={}) {
  var src = typeof expr === 'object' ? src : M.parse(expr);
  var expanded = expand(src, true, args);
  var derived = M.derivative(expanded, by);
  return derived;
}

function formatGraphExpr(expr) {
  var src = typeof expr === 'object' ? src : M.parse(expr);
  var expanded = expand(src, true);

  console.log(expanded);

  var str =  expanded.toString();
  console.log(str);

  return str;
}

function expand(node, replaceConstants, localScope={}) {    

  if (node.content) { // Parenthesis 
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
    var def = functionDefs[node.fn.name];
    if (typeof def == 'undefined') { 
      node.args = node.args.map( (a)=> 
      expand(a, replaceConstants, localScope) 
      );     
  
      return node; 
    } else {
      var bodyNode = M.parse(def.body);
      var bodyScope = {};
      for(var i=0;i<def.args.length;i++) {
        var argName = def.args[i];
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
          return M.parse(result);
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

function evalEquation(equation, varMap, constant) {
  var scope = { constant: constant }
  Object.keys(varMap).forEach( (varName) => scope[varName] = GameVar.getValue(varMap[varName]) );
//  console.log(scope);
  return compile('constant + ' + Eq.eqString(equation)).evaluate(scope);
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

function displayFunction(name, elementIdPrefix="", graphId="", args={}) {

  if ( typeof elementIdPrefix !== 'undefined' && elementIdPrefix !== "") {
    displayExpr( functionDefs[name].body, 'x', elementIdPrefix, args);
  }

  const expr = functionDefs[name].body;
  const expanded = expand(M.parse(expr), true, args);
  plot(graphId, expanded.toString()); 
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
  
  
  const partPromises = parts.map( (part) => { 
    var el = document.getElementById(part.id);
    var tex = part.toTex();
    return MathJax.tex2chtmlPromise(tex, { em: 64, ex: 16, display: false, scale: 2 }).then(
    nodeHtml => {
      if (el) {
        el.innerHTML = '';
        el.appendChild(nodeHtml);
      }
    });
  });

  
    MathJax.typesetClear();

    Promise.all(partPromises).then(MathJax.typesetPromise()).then(createHovers);

  


}