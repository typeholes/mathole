export function typeset(parts) { //}: { id: string; toTex: () => string; }[]) {
    const partPromises = parts.map((part) => {
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