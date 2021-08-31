function logEqVar(e){ return function() {console.log("var: " + e)}; }

Vue.component('eq-var', {
  props: {
    src:{},
  },
  template: 
  `
  <div> 
    {{ src.displayName }} 
    <button v-on:click="src.handler">log</button>
  </div>
  ` 
})

Vue.component('eq-op', {
  props: {
    src:{},
  },
  template: 
  `
  <div> 
    op: {{ src.op }} 
  </div>
  ` 
})


var eqVars = {}

var app = new Vue({
  el: '#app',
  data: {
    eqVars: {},
    logEqVar: logEqVar,
  },

}) 


 Vue.set(app.eqVars, "var1", new EqVar("Var 1", "var1", 5));

 Vue.set(app.eqVars, "var2", new EqVar("Var 2", "var2", 7));

 Vue.set(app.eqVars, "op1", new EqOp("var1", "var2", "+"));
