<script setup>

import { inject} from 'vue';

const handleSelection = inject('handleSelection');
const isSelected = inject('isSelected');


defineProps({
    src: null,
})

</script>

<template>
  <button :class="isSelected(src)" @click.self="()=>handleSelection(src)">
    {{ src.displayName }}
  </button>

</template>

<style scoped>
button {
  background-color: #dee7a7;
}
button.selected {
  background-color: #42b983;
}
</style>
