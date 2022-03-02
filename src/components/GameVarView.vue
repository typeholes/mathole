<script setup lang="ts">

import { i } from 'mathjs';
import { inject, ref } from 'vue';

import { GameState } from '../js/GameState';
import { clickActionsT } from './types';

interface Props {
  varName: string,
  forceVisible: boolean,
  dependencies: string[]
  dependents: string[],
  graphed: string
}


const emit = defineEmits<{
  (e: 'update:dependencies', dependencies: string[]): void
  (e: 'update:graphed', graphed: string): void
  (e: 'update:dependents', dependents: string[]): void
}>();

const clickActions = inject<()=>clickActionsT>('clickActions')();

const props = withDefaults(defineProps<Props>(), {
  varName: "",
  forceVisible: false,
  dependencies: () => [],
  dependents: () => [],
  graphed: ""
})

const gameState = GameState.getInstance();

function getValue(varName: string) {
  const val = gameState.getValue(varName);
  return Math.round(val *100)/100;
}

function getCost(varName: string) {
  const val = gameState.getCost(varName);
  return Math.round(val *100)/100;
}

function canBuy(varName: string) {
  const currencyName = gameState.getCurrencyName(varName);
  if (!currencyName) { return false;}

  const currency = gameState.getValue(currencyName);

  return currency >= getCost(varName);

}

function labelClass(varName: string, dependencies: string[], dependents: string[]) {
  let ret = {dependent: false, depends: false};
  
  if ( clickActions.dependents && dependencies.includes(varName)) {
     ret.dependent = true;
  }

  if ( clickActions.dependencies && dependents.includes(varName)) {
     ret.depends = true;
  }

  return ret;
}

function labelClick(varName: string) {
  let newDependencies = varName === 'stability' ? ['marketValue', 'stability'] : ['marketScale'];
  let newDependents = varName === 'marketScale' ? ['marketValue', 'stability'] : ['stability'];

  emit('update:dependencies', newDependencies);
  emit('update:dependents', newDependents);
  emit('update:graphed', varName);
  
  if ( clickActions.graph ) {
    gameState.displayFunction(varName, '#test-graph-expr');  
  }
  
}

function buy(varName: string, graphedVar: string ) {
  gameState.buy(varName);
  if (graphedVar !== '') { gameState.displayFunction(graphedVar, '#test-graph-expr');  }
}


</script>

<template>
  <div>
    <div v-if="forceVisible || gameState.isVisible(varName)">    
        <span :class="labelClass(varName, dependencies, dependents)" @click="labelClick(varName)">{{ gameState.getDisplayName(varName) }}: </span> {{ getValue(varName) }}         
        <button @click="buy(varName, graphed)" v-if="gameState.isBuyable(varName)" :disabled="!canBuy(varName)" > 
            Cost: {{ getCost(varName) }} {{ gameState.getCurrencyDisplayName(varName) }}
        </button> <br>
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

.dependent {
 background-color: #6cf5de;
}
 
.depends {
  background-color: #9e83f8;
}
</style>
