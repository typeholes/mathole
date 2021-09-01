

math.simplify.rules.push({ l: 'n1*n2/(n1*n3)', r: 'n2/n3' });


function texExpr(expr) {
  let parenthesis = 'keep';
  let implicit = 'hide';

  return function() { 
    var node = math.parse(expr);
    return  node.transform(addHandlers).toTex({ parenthesis: parenthesis, implicit: implicit }); 
  };
}

function texDerivative(expr, selectedVar) {
  var node = math.parse(expr);
  return ()=> math.derivative(node, selectedVar).toTex();
}

function displayExpr(expr, valExpr, selectedVar) {


  const parts = [
    { id: 'pretty',
      toTex: texExpr(expr),
    },
    { id: 'pretty-val',
      toTex: texExpr(valExpr),
    },
    { id: 'derivative',
      toTex: texDerivative(expr, selectedVar),      
    },
    { id: 'derivative-val',
      toTex: texDerivative(valExpr, selectedVar),      
    },
  ];

  const partPromises = parts.map( (part) => { 
    var el = document.getElementById(part.id);
    var tex = part.toTex();
    return MathJax.tex2chtmlPromise(tex, { em: 64, ex: 16, display: false, scale: 5 }).then(
    nodeHtml => {
      el.innerHTML = '';
      el.appendChild(nodeHtml);
    });
  });

  
    MathJax.typesetClear();

    Promise.all(partPromises).then(MathJax.typesetPromise()).then(createHovers);



}