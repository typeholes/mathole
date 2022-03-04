<script setup lang="ts">

import GameVarView from './GameVarView.vue';
import { GameState } from '../js/GameState';
import { injects, PropKeys } from './types';

const gameState = GameState.getInstance();

const { dependencies, dependents, graphedVarName, selectedVarName} = injects( PropKeys.Dependencies, PropKeys.Dependents, PropKeys.GraphedVarName, PropKeys.SelectedVarName);

</script>

<template>
  <div>
    <h1> <GameVarView varName="t" v-model:dependencies="dependencies" v-model:dependents="dependents" forceVisible v-model:graphedVarName="graphedVarName" v-model:selectedVarName="selectedVarName"></GameVarView> </h1>
    <h1> <GameVarView varName="score" v-model:dependencies="dependencies" v-model:dependents="dependents" forceVisible v-model:graphedVarName="graphedVarName" v-model:selectedVarName="selectedVarName"></GameVarView> </h1>

  <div v-for="(varName) in gameState.getNames()">
    <GameVarView :varName="varName" v-model:dependencies="dependencies" v-model:dependents="dependents" v-model:graphedVarName="graphedVarName" v-model:selectedVarName="selectedVarName"></GameVarView>
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
