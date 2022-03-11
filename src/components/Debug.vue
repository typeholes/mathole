<script setup lang="ts">

import Vsplitter from './Vsplitter.vue';
import DebugVarView from './DebugVarView.vue';
import { GameState } from '../js/GameState';
import { UiGameState, UiState, uiState } from './uiUtil';
import { ref } from 'vue';

const gameState : UiGameState = GameState.getInstance();

const jankyCollapsed = ref (false);

function getNames() : string[] {
  const names = [...gameState.getNames()].sort();
  return names;
}

</script>

<template>
  <div>
          <table class="vars">
            <div style="display: table-row-group" v-for="(varName) in getNames()">
              <DebugVarView :varName="varName"></DebugVarView>
            </div>
          </table>
          </div>
</template>          

