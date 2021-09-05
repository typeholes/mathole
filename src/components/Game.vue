<script setup>

import { inject, provide, ref} from 'vue';
import GameVarView from './GameVarView.vue';
import { ST } from '../js/ST';

const { varList, score } = ST.useState( 'varList', 'score' ); 

</script>

<template>
  <div>
    <h1> Score: {{ score }} </h1>
  <div v-for="(_, idx) in varList.value()">
      <GameVarView :idx="idx"></GameVarView>
  </div>
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
