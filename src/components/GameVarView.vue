<script setup lang="ts">

import { GameState } from '../js/GameState';
import { formatNumber } from '../js/util';
import { injects, PropKeys, getCost, getSellCost, getValue } from './uiUtil';


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

//TODO: this belongs in GameState
function canSell(varName: string) : boolean {
  const cnt = getValue(varName);

  return cnt > 0;
}

//TODO: this belongs in GameState
function canBuy(varName: string) : boolean {
  const currencyName = gameState.getCurrencyName(varName);
  if (!currencyName) { return false;}

  const currency = getValue(currencyName);

  return currency >= getCost(varName);

}

function labelClass(varName: string, selectedVarName: string, dependencies: string[], dependents: string[]) {
  let ret = {marker: true, dependent: false, depends: false, hidden: true, inline: true};
  
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
    <div class="gamevar" v-if="forceVisible || gameState.isVisible(varName)">    
        <div :class="labelClass(varName, selectedVarName, dependencies, dependents)">
          <span> {{ varName === selectedVarName ? "&#8860" : "&#8658" }} </span></div>
        <div class="label">
          <span  @click="labelClick(varName)">{{ gameState.getDisplayName(varName) }}: </span> 
        </div>
       <div class="value">
          {{ formatNumber(getValue(varName)) }}         
       </div> 
        <div class="buy">
          <button @click="buy(varName, graphedVarName)" v-if="gameState.isBuyable(varName)" :disabled="!canBuy(varName)" > 
              Buy: {{ formatNumber(getCost(varName)) }} {{ gameState.getCurrencyDisplayName(varName) }}
          </button> 
        </div>
        <div class="sell">
          <button @click="sell(varName, graphedVarName)" v-if="gameState.isSellable(varName)" :disabled="!canSell(varName)">Sell: {{ formatNumber(getSellCost(varName)) }} {{ gameState.getCurrencyDisplayName(varName) }}</button> 
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

.marker {
  display: block;
  grid-column: 1;
  justify-self: end;
}

.label {
  display: block;
  grid-column: 2;
  justify-self: end;
}

.value {
  display: block;
  grid-column: 3;
  justify-self: start;
}

.buy {
  display: block;
  grid-column: 4;
  justify-self: start;
}

.sell {
  display: block;
  grid-column: 5;
  justify-self: start;
}

.gamevar {
  display: contents
}


</style>
