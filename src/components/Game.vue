<script setup>

import GameVarView from './GameVarView.vue';
import { GameState } from '../GameState';


const gameState = GameState.getInstance();

function getValue(name) {
  const val = gameState.getValue(name);

  return Math.floor(val*100)/100;

}

function setScore() {
  GameState.setVariable('score','444');
}
</script>

<template>
  <div>

    <!-- <h1> Time: {{ getValue('t') }} </h1> -->
    <h1> Score: {{getValue('score') }} </h1>

  <div v-for="(varName) in gameState.getNames()">
    <GameVarView :varName="varName"></GameVarView>
  </div>

  <div id='test-graph-expr' class="graphDiv"></div>
  
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
