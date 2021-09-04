export {eqRoot};
export default {};

import * as Eq  from './js/Eq';

// var eqRoot = 
// Eq.newEqOp(
//   Eq.newEqVar("Var 1", "var1", 5),
//   "+",
//   Eq.newEqOp(
//     Eq.newEqVar("Var 2", "var2", 7),
//     "*",
//     Eq.newEqOp(
//       Eq.newEqVar("Var 3", "var3", 9),
//       "^",
//       Eq.newEqVar("Var 4", "var4", 11),
//     )
//   )
// );

// Vue.use((Vue) => {
//   Vue.prototype.$bubble = function $bubble(eventName, ...args) {
//     // Emit the event on all parent components
//     let component = this;
//     do {
//       component.$emit(eventName, ...args);
//       component = component.$parent;
//     } while (component);
//   };
// });

// Vue.component('equation', {
//   props: { root: {}
//   },
//   data: function(){ return {
//     selected: eqRoot
//   }},
//   methods: {
//     handleSelection: function (e) { 
//       this.selected = e; 
//       displayExpr(this.root.eqString(), this.root.valString(e.eqString()), e.eqString()); 
//     }
//   },
//   template:
//   `
//   <div>    
//     <component v-bind:is="root.component" :src="root" v-on:select-term="handleSelection" ></component>
//     <div> selected: {{ selected.eqString() }} <br>
//       Pretty: <div id="pretty"></div> <br>
//       Pretty Val: <div id="pretty-val"></div> <br>
//       Derivative: <div id="derivative"></div>      
//       Derivative Val: <div id="derivative-val"></div>      
//     </div>     
//   </div>
//   `

// });

// Vue.component('eq-var', {
//   props: {
//     src:{},
//   },
//   template: 
//   `
//   <button v-on:click.self="$bubble('select-term',src)"> 
//     {{ src.displayName }} 
//   </button>
//   ` 
//   })

// Vue.component('eq-op', {
//   props: {
//     src:{},
//   },
//   methods: {
// //    logit: function(e) {  console.log('op'); }
//   },
//   template: 
//   `
//   <button v-on:click.self="$bubble('select-term',src)" > (
//     <component v-bind:is="src.left.component" :src="src.left" ></component>
//     {{ src.op }} 
//     <component v-bind:is="src.right.component" :src="src.right" ></component>
//     )
//     </button> 
//   ` 
// })



// var app = new Vue({
//   el: '#app',
//   data: {
//     root: eqRoot
//   },
//   methods: {
//   },

// }); 
