<script setup lang="ts">

import GameVarView from './GameVarView.vue';
import { GameState } from '../js/GameState';
import { ref } from 'vue';

import { FunctionDefManager } from '../js/FunctionDef';
import { displayFunction } from '../js/mathUtil';

const gameState = GameState.getInstance();

function getValue(name) {
  const val = gameState.getValue(name);

  return Math.floor(val*100)/100;

}

let dependencies = ref([]);
let dependents = ref([]);
let graphedVar = ref("");

</script>

<template>
  <div>
    <!-- <h1> Time: {{ getValue('t') }} </h1> -->
    <h1> <GameVarView varName="score" v-model:dependencies="dependencies" v-model:dependents="dependents" forceVisible v-model:graphed="graphedVar"></GameVarView> </h1>

  <div v-for="(varName) in gameState.getNames()">
    <GameVarView :varName="varName" v-model:dependencies="dependencies" v-model:dependents="dependents" v-model:graphed="graphedVar"></GameVarView>
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
