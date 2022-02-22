<script setup>

import GameVarView from './GameVarView.vue';
import { ST } from '../js/ST';

import { getValue } from '../js/GameVar';

const { varMap} = ST.useState( 'varMap'); 



function getScore() {
  const scoreVar = varMap.value()['score'];
  return getValue(scoreVar);
}

</script>

<template>
  <div>
    <h1> Score: {{ getScore()}} </h1>

  <div v-for="(_, varName) in varMap.value()">
      <GameVarView :varName="varName"></GameVarView>
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
