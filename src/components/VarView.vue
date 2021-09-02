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

const vars = [
    new EqVar("Var 2", "var2", 3),
    new EqVar("Var 3", "var3", 5),
    new EqVar("Var 4", "var4", 7),
];

function handleSelection (e, dummy, l_selected=selected) { 
      if (!l_selected) return;
    l_selected.value = e;
}

makeViewMap(inject, provide, id.value, handleSelection, selected, 
    [EqNode.component,EqNodeView], 
    [EqVar.component,EqVarView], 
    [EqOp.component,EqOpView],
);

</script>

<template>
   <div>    
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
