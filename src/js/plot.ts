


import functionPlot from "function-plot";

export function plot(target: string, expr: string, title: string) {

functionPlot({
    target: target,
    title: title,
    width: 300,
    //  height: 500,
    yAxis: { domain: [-1, 9] },
    grid: true,
    data: [
      // { fn: derivativeExpr, color: 'yellow' },
      // { fn: derivativeExpr, color: 'green', graphType: 'polyline' },
      { fn: expr, color: 'purple', graphType: 'polyline' },
    ],
    tip: {
      renderer: function (x: number, y: number, index: number) {
        return y.toString();
      }
    }
  });

}