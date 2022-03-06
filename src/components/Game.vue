<script setup lang="ts">

import GameVarView from './GameVarView.vue';
import { GameState } from '../js/GameState';

const gameState = GameState.getInstance();

</script>

<template>
  <div class="game">
    <div class="mainVar">
      <GameVarView varName="t" forceVisible ></GameVarView> 
      <GameVarView varName="money" forceVisible></GameVarView>
    </div>
    <div class="vars">
      <div class="contents" v-for="(varName) in gameState.getNames()">
        <GameVarView :varName="varName"></GameVarView>
      </div>
    </div>

  
  </div>
</template>

<style >
button {
  background-color: #dee7a7;
}
button.selected {
  background-color: #9342b9;
}

.contents {
  display: contents
}

.game {
  display: grid;
  /* grid-template-columns: repeat(5, 1fr); */
  grid-auto-rows: minmax(20px, auto);
  grid-template-columns: repeat(5,minmax(content,1fr)); 
  gap: 10px;
}

.mainVar {
  grid-row: 1;
  display: contents;
}

.vars {
  grid-row: 2;
  display: contents
}

.graphVar {
  grid-row: 3
}

.graphDiv {
  grid-column: 1/5;
}
</style>
