<script setup>

import { inject, provide, ref} from 'vue';
import GameVarView from './GameVarView.vue';

const varList = inject('varList');

</script>

<template>
  <div v-for="_var in varList">
      <GameVarView :src="_var"></GameVarView>
  </div>
</template>

<style scoped>
button {
  background-color: #dee7a7;
}
button.selected {
  background-color: #9342b9;
}
</style>
