<script setup>


import { GameState } from '../GameState';


defineProps({
    varName: null,
})

const gameState = GameState.getInstance();

function getValue(varName) {
  const val = gameState.getValue(varName);
  return Math.round(val *100)/100;
}

function getCost(varName) {
  const val = gameState.getCost(varName);
  return Math.round(val *100)/100;
}

</script>

<template>
    <div v-if="gameState.isVisible(varName)">    
        {{ gameState.getDisplayName(varName) }}: {{ getValue(varName) }}         
        <button @click="gameState.buy(varName)" v-if="gameState.isBuyable(varName)">
            Cost: {{ getCost(varName) }}
        </button> <br>
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
