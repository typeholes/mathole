<script setup>
import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';
import { inject } from  'vue'
import EqNode from '../js/EqNode';

defineProps({
    src: null,
})

const getView = inject('getView');
const handleSelection = inject('handleSelection');
const isSelected = inject('isSelected');

</script>

<template>
  <button :class="isSelected(src) " @click.self="()=>handleSelection(src)">      
    <component v-bind:is="getView(src.left.component)" :src="src.left" ></component>
    {{ src.op }}
    <component v-bind:is="getView(src.right.component)" :src="src.right" ></component>
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