function logEqVar(e){ return function() {console.log("var: " + e)}; }

Vue.component('eq-var', {
  props: {
    src:{},
  },
  template: 
  `
  <span> 
    {{ src.displayName }} 
  </span>
  ` 
//     <button v-on:click="src.handler">log</button>
})

Vue.component('eq-op', {
  props: {
    src:{},
  },
  template: 
  `
  <span> (
    <component v-bind:is="src.left.component" :src="src.left"  ></component>
    {{ src.op }} 
    <component v-bind:is="src.right.component" :src="src.right"  ></component>
    )
    </span> 
  ` 
})


var eqRoot = 
new EqOp(
  new EqVar("Var 1", "var1", 5),
  "+",
  new EqOp(
    new EqVar("Var 2", "var1", 7),
    "*",
    new EqVar("Var 3", "var2", 9),
  )
);

var app = new Vue({
  el: '#app',
  data: {
    root: eqRoot,
    logEqVar: logEqVar,
  },

}); 
