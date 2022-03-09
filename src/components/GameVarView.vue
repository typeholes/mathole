<script setup lang="ts">

import { GameState } from '../js/GameState';
import { formatNumber } from '../js/util';
import { getCost, getSellCost, getValue, Globals, mainClick as labelClick, refreshGraph } from './uiUtil';

interface Props {
  varName: string,
  forceVisible?: boolean,
  hideCnt?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  forceVisible: false,
  hideCnt: false
})

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

function labelClass(varName: string) {
  let ret = {marker: true, dependent: false, depends: false, hidden: true, inline: true};
  
  if ( varName === Globals.selectedVarName) {
    ret.hidden = false;
    return ret;
  } 

  if ( Globals.dependencies.includes(varName)) {
     ret.dependent = true;
     ret.hidden = false;
  }

  if ( Globals.dependents.includes(varName)) {
     ret.depends = true;
     ret.hidden = false;
  }

  return ret;
}



function sell(varName: string) {
  gameState.sell(varName);
  refreshGraph();
}

function buy(varName: string) {
  gameState.buy(varName);
  refreshGraph();
}


</script>

<template>
    <div class="gamevar" v-if="forceVisible || gameState.isVisible(varName)">    
        <div :class="labelClass(varName)">
          <span> {{ varName === Globals.selectedVarName ? "&#8860" : "&#8658" }} </span></div>
        <div class="label">
          <span  @click="labelClick(varName)">{{ gameState.getDisplayName(varName) }}: </span> 
        </div>
       <div class="value" v-if="!props.hideCnt">
          {{ formatNumber(getValue(varName)) }}         
       </div> 
        <div class="buy">
          <button @click="buy(varName)" v-if="gameState.isBuyable(varName)" :disabled="!canBuy(varName)" > 
              Buy: {{ formatNumber(getCost(varName)) }} {{ gameState.getCurrencyDisplayName(varName) }}
          </button> 
        </div>
        <div class="sell">
          <button @click="sell(varName)" v-if="gameState.isSellable(varName)" :disabled="!canSell(varName)">Sell: {{ formatNumber(getSellCost(varName)) }} {{ gameState.getCurrencyDisplayName(varName) }}</button> 
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
