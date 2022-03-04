<script setup lang="ts">

import { GameState } from '../js/GameState';
import { injects, PropKeys } from './types';


interface Props {
  varName: string,
  forceVisible: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  forceVisible: false,
})

const { clickAction, dependencies, dependents, graphedVarName, selectedVarName } = injects( 
  PropKeys.ClickAction, 
  PropKeys.Dependencies,
  PropKeys.Dependents,
  PropKeys.GraphedVarName,
  PropKeys.SelectedVarName 
  );

const gameState = GameState.getInstance();

function getValue(varName: string) {
  const val = gameState.getValue(varName);
  return Math.round(val *100)/100;
}

function getCost(varName: string) {
  const val = gameState.getCost(varName);
  return Math.round(val *100)/100;
}

//TODO: this belongs in GameState
function canSell(varName: string) : boolean {
  const cnt = gameState.getValue(varName);

  return cnt > 0;
}

//TODO: this belongs in GameState
function canBuy(varName: string) : boolean {
  const currencyName = gameState.getCurrencyName(varName);
  if (!currencyName) { return false;}

  const currency = gameState.getValue(currencyName);

  return currency >= getCost(varName);

}

function labelClass(varName: string, selectedVarName: string, dependencies: string[], dependents: string[]) {
  let ret = {dependent: false, depends: false, hidden: true, inline: true};
  
  if ( varName === selectedVarName) {
    ret.hidden = false;
    return ret;
  } 

  if ( dependencies.includes(varName)) {
     ret.dependent = true;
     ret.hidden = false;
  }

  if ( dependents.includes(varName)) {
     ret.depends = true;
     ret.hidden = false;
  }

  return ret;
}


function labelClick(varName: string) {
  
  if ( clickAction.value === 'select') {
    selectedVarName.value = varName;
    let newDependencies = gameState.getDependencies(varName);
    let newDependents = gameState.getDependents(varName);

    dependencies.value =  newDependencies;
    dependents.value = newDependents;
  }
  
  if ( clickAction.value === 'graph' ) {
    graphedVarName.value = varName;
    gameState.displayFunction(varName, '#test-graph-expr', gameState.getNameMap(), graphTitle(varName));  
  }
  
}

function sell(varName: string, graphedVarName: string ) {
  gameState.sell(varName);
  if (graphedVarName !== '') { gameState.displayFunction(graphedVarName, '#test-graph-expr', gameState.getNameMap(), graphTitle(graphedVarName));  }
}

function buy(varName: string, graphedVarName: string ) {
  gameState.buy(varName);
  if (graphedVarName !== '') { gameState.displayFunction(graphedVarName, '#test-graph-expr', gameState.getNameMap(), graphTitle(graphedVarName));  }
}

function graphTitle(varName: string) : string {
  const prefix = gameState.isBuyable(varName) ? "Cost of " : "";
  return prefix + gameState.getDisplayName(varName);
}

</script>

<template>
  <div>
    <div v-if="forceVisible || gameState.isVisible(varName)">    
        <div :class="labelClass(varName, selectedVarName, dependencies, dependents)"><span> {{ varName === selectedVarName ? "&#8860" : "&#8658" }} </span></div>
        <span  @click="labelClick(varName)">{{ gameState.getDisplayName(varName) }}: </span> {{ getValue(varName) }}         
        <button @click="buy(varName, graphedVarName)" v-if="gameState.isBuyable(varName)" :disabled="!canBuy(varName)" > 
            Buy
        </button> 
        <button @click="sell(varName, graphedVarName)" v-if="gameState.isSellable(varName)" :disabled="!canSell(varName)">sell</button> 
        <span v-if="gameState.isBuyable(varName) || gameState.isSellable(varName)"> Cost: {{ getCost(varName) }} {{ gameState.getCurrencyDisplayName(varName) }}</span><br>
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

.inline {
  display: inline-block;
}
.dependent {
 color: #6cf5de;
 transform: rotateY(.5turn)
}

.selected{
  color: #000000;
}
.depends {
  color: #9e83f8;
 transform: rotateY(0turn)
}

.hidden {
  visibility: hidden;
}

</style>
