<script setup>

import * as Eq  from '../js/Eq';

import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';
import displayExpr from "../js/mathUtil";

import {  inject, provide, ref, toRefs} from 'vue';
import { makeViewMap } from "../js/makeViewMap";

import { ST } from "../js/ST"

const props = defineProps({    
    id: String
})

const { id } = toRefs(props);

var selected = ref(Eq.newEqEmpty());

const { varList } = ST.useState( 'varList' );

makeViewMap(inject, provide, id.value, selected, 
    [Eq.EqEmpty__type,EqNodeView], 
    [Eq.EqVar__type,EqVarView], 
    [Eq.EqOp__type,EqOpView],
);

</script>

<template>
   <div>    
       <button @click="varList.addVar">Add Var</button>
     <ul v-for="_var in varList.value()"> 
         <li><eq-var-view :src="_var"></eq-var-view></li>
     </ul> 
   </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
