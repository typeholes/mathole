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

</script>

<template>
  <button> (      
    <component v-bind:is="getView(src.left.component)" :src="src.left" :selected="selected"></component>
    {{ src.op }}
    <component v-bind:is="getView(src.right.component)" :src="src.right" :selected="selected"></component>
    )
    </button>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
