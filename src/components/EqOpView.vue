<script setup>
import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';

defineProps({
    src: null,
})


</script>

<template>
  <button v-on:click.self="$bubble('select-term',src)" > (      
    <component v-bind:is="src.left.resolveView()" :src="src.left" ></component>
    {{ src.op }}
    <component v-bind:is="src.right.resolveView()" :src="src.right" ></component>
    )
    </button>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
