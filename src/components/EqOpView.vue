<script setup>
import EqNodeView from './EqNodeView.vue';
import EqOpView  from './EqOpView.vue';
import EqVarView from  './EqVarView.vue';
import { inject } from  'vue'

defineProps({
    src: null,
})

const getView = inject('getView');

</script>

<template>
  <button> (      
    <component v-bind:is="getView(src.left.component)" :src="src.left" ></component>
    {{ src.op }}
    <component v-bind:is="getView(src.right.component)" :src="src.right" ></component>
    )
    </button>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
