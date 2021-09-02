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
       <eq-op-view :src="root"></eq-op-view>
       <component v-bind:is="root.component" :src="root" v-on:select-term="handleSelection" ></component>
     <div> selected: {{ selected.eqString() }} <br> 
     <!-- <div> selected: {{ selected }} <br> -->
       Pretty: <div id="pretty"></div> <br>
       Pretty Val: <div id="pretty-val"></div> <br>
       Derivative: <div id="derivative"></div>      
       Derivative Val: <div id="derivative-val"></div>      
     </div>     
   </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
