<script setup>

import EqVar from "../js/EqVar.ts";
import EqOp from "../js/EqOp.ts";
import EqNode from "../js/EqNode.ts";
import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';
import displayExpr from "../js/mathUtil";

import {provide, ref, toRefs} from 'vue';

const props = defineProps({
    root: null,
})

const { root } = toRefs(props);

var selected = ref(new EqNode());

const terms = [
    new EqOp( new EqNode(), "+", new EqVar("Var 2", "var2", 3) ),
    new EqOp( new EqNode(), "*", new EqVar("Var 3", "var3", 5) ),
    new EqOp( new EqNode(), "^", new EqVar("Var 4", "var4", 7) ),
];

function handleSelection (e, l_root=root, l_selected=selected) { 
    selected.value = e;       
    var val = l_root.value;
    if (root) displayExpr(val.eqString(), val.valString(e.eqString()), e.eqString()); 
}

provide('handleSelection', handleSelection);
provide('selected', selected);
provide('root','root');


</script>

<template>
   <div>    
     <ul v-for="term in terms"> 
         <li><eq-op-view :src="term"></eq-op-view></li>
     </ul> 
   </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
