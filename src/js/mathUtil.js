import {simplify, derivative, compile, parser as mkParser} from 'mathjs';
import * as Eq from './Eq';
import * as GameVar from './GameVar';

import { addHandlers, createHovers } from './mathHovers';

export default displayExpr;
export { displayExpr, evalEquation, runDefinition, runString };


simplify.rules.push({ l: 'n1*n2/(n1*n3)', r: 'n2/n3' });

const parser = mkParser();

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
  debugger;
  var result = 'Not Run';
  try {
    result = parser.evaluate(str); 
  } catch(err) {
    result = err;
  }
  return result;
}

function setVariable(varName, value) {
  parser.set(varName,value);
}

function evalEquation(equation, varMap, constant) {
  var scope = { constant: constant }
  Object.keys(varMap).forEach( (varName) => scope[varName] = GameVar.getValue(varMap[varName]) );
//  console.log(scope);
  return compile('constant + ' + Eq.eqString(equation)).evaluate(scope);
}

function texExpr(expr) {
  let parenthesis = 'keep';
  let implicit = 'hide';  

  return function() { 
    var node = parser.parse(expr);
    return  node.transform(addHandlers).toTex({ parenthesis: parenthesis, implicit: implicit }); 
  };
}

function texDerivative(expr, selectedVar) {
  var node = parser.parse(expr);
  return ()=> derivative(node, selectedVar).toTex();  
}

function displayExpr(expr, valExpr, selectedVar, elementIdPrefix="") {


  const parts = [
    { id: elementIdPrefix + 'pretty',
      toTex: texExpr(expr),
    },
    { id: elementIdPrefix + 'pretty-val',
      toTex: texExpr(valExpr),
    },
    { id: elementIdPrefix + 'derivative',
      toTex: texDerivative(expr, selectedVar),      
    },
    { id: elementIdPrefix + 'derivative-val',
      toTex: texDerivative(valExpr, selectedVar),      
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