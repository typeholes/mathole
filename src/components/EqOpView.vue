<script setup>
import * as Eq  from '../js/Eq';

import { inject } from  'vue'



import { ST } from '../js/ST';

defineProps({
    src: null,
})

const getView = inject('getView');

const { _selectedOp } = ST.useState ('_selectedOp');

</script>

<template>
  <button :class="_selectedOp.isSelected(src) " @click.self="()=>_selectedOp.set(src)">          
    <component v-bind:is="getView(src.left.__type)" :src="src.left" ></component>
    {{ src.op }}
    <component v-bind:is="getView(src.right.__type)" :src="src.right" ></component>
    </button>
</template>

<style scoped>
button {
  background-color: #dee7a7;
}
button.selected {
  background-color: #9342b9;
}
</style>