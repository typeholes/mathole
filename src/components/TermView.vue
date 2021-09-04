<script setup>

import * as Eq  from '../js/Eq';

import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';

import { makeViewMap } from "../js/makeViewMap";

import { toRefs } from 'vue';

import { ST } from "../js/ST";

const props = defineProps({    
    id: String
})

const { id } = toRefs(props);

const { termList } = ST.useState( 'termList' );

</script>

<template>
   <div>    
     <ul v-for="term in termList.value()"> 
         <li><eq-op-view :src="term" ></eq-op-view></li>
     </ul> 
   </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
