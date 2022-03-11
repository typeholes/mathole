<script setup lang="ts">

import Vsplitter from './Vsplitter.vue';
import GameVarView from './GameVarView.vue';
import JankyMarketTrader from './JankyMarketTrader.vue';
import { GameState } from '../js/GameState';
import { Globals, UiGameState, UiState, uiState } from './uiUtil';
import { ref } from 'vue';

const gameState : UiGameState = GameState.getInstance();

const jankyCollapsed = ref (false);

function getNames() : string[] {
  const names = gameState.getNames( (varFields) => !varFields.janky);
  return names;
}

</script>

<template>
  <div class="game">
    <Vsplitter leftColSpec ="45%" rightColSpec="1fr" v-model:collapsed="jankyCollapsed">
      <template #left>
        <JankyMarketTrader></JankyMarketTrader>
      </template>
      <template #right>
        <div v-if="uiState.vars.loggedIn.value>0" class="varPane">
          <div class="mainVar">
            <GameVarView varName="t" forceVisible ></GameVarView> 
            <GameVarView varName="money" forceVisible></GameVarView>
          </div>
          <div class="vars">
            <div class="contents" v-for="(varName) in getNames()">
              <GameVarView :varName="varName"></GameVarView>
            </div>
          </div>
        </div>
      </template>
    </Vsplitter>
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
  grid-column: 1;
  grid-row: 2;
}

.varPane {
  grid-column: 3;
  display: grid;
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
