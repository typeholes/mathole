<script setup>

import { inject} from 'vue';

const  handleSelection = inject('handleSelection');

defineProps({
    src: null,
})

</script>

<template>
  <button v-on:click.self="handleSelection(src)">
    {{ src.displayName }}
  </button>

</template>

<style scoped>
a {
  color: #42b983;
}
</style>
