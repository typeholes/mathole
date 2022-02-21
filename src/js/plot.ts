


import functionPlot from "function-plot";

import { formatGraphExpr } from "./mathUtil";

export function plot(target, expr) {




functionPlot({
    target: target,
    title: "graph",
    //  width: 500,
    //  height: 500,
    yAxis: { domain: [-1, 9] },
    grid: true,
    data: [
      {
        fn: formatGraphExpr(expr)
      }
    ],
    tip: {
      renderer: function (x: number, y: number, index: number) {
        return y.toString();
      }
    }
  });

}