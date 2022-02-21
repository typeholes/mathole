


import functionPlot from "function-plot";

import { formatGraphExpr, getDerivative } from "./mathUtil";

export function plot(target, expr) {


const graphExpr = formatGraphExpr(expr);

functionPlot({
    target: target,
    title: "graph",
    //  width: 500,
    //  height: 500,
    yAxis: { domain: [-1, 9] },
    grid: true,
    data: [
      { fn: getDerivative(graphExpr,'x').toString(), color: 'yellow' },
      { fn: getDerivative(graphExpr,'x').toString(), color: 'green', graphType: 'polyline' },
      { fn: graphExpr, color: 'purple' },
    ],
    tip: {
      renderer: function (x: number, y: number, index: number) {
        return y.toString();
      }
    }
  });

}