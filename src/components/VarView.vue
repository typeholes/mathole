<script setup>

import EqVar from "../js/EqVar.ts";
import EqOp from "../js/EqOp.ts";
import EqNode from "../js/EqNode.ts";
import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';
import displayExpr from "../js/mathUtil";

import {provide, ref, toRefs, inject} from 'vue';
import { makeViewMap } from "../js/makeViewMap";

const props = defineProps({    
    id: String
})

const { id } = toRefs(props);

var selected = ref(new EqNode());

const vars = ref([
    
]);

const varCount = ref(0);

function addVar(l_vars = vars) { 
    console.log(['add var', vars]);
    varCount.value++;
    var num = varCount.value.toString();
    vars.value.push(new EqVar('Var ' + num, 'var' + num, varCount.value ));
}

const handleTermVarSelection = inject('handleTermVarSelection');

function handleSelection (e, dummy, l_selected=selected) { 
      if (!l_selected) return;
    l_selected.value = e;
    handleTermVarSelection(l_selected.value);
}

makeViewMap(inject, provide, id.value, handleSelection, selected, 
    [EqNode.component,EqNodeView], 
    [EqVar.component,EqVarView], 
    [EqOp.component,EqOpView],
);

</script>

<template>
   <div>    
       <button @click="addVar">Add Var</button>
     <ul v-for="_var in vars"> 
         <li><eq-var-view :src="_var"></eq-var-view></li>
     </ul> 
   </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
