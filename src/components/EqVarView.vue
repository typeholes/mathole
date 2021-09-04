<script setup>

import { inject} from 'vue';
import { ST } from '../js/ST';

const { _selectedVar } = ST.useState( '_selectedVar' );


defineProps({
    src: null,
})

</script>

<template>
  <button :class="_selectedVar.isSelected(src)"  @click.self="()=>_selectedVar.set(src)">
    {{ src.displayName }}
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
