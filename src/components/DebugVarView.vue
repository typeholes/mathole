<script setup lang="ts">

import { GameState } from '../js/GameState';
import { formatNumber } from '../js/util';
import { getCost, getTotal, getSellCost, getValue, Globals, mainClick as labelClick, refreshGraph } from './uiUtil';

interface Props {
  varName: string,
}

const props = withDefaults(defineProps<Props>(), {
})

const gameState = GameState.getInstance();

</script>

<template>
    <tr class="gamevar" >
            <td>{{ varName }}</td>
            <td>{{ formatNumber(getValue(varName)) }}         </td>
            <td>{{ formatNumber(getTotal(varName)) }}         </td>
            <td>{{ formatNumber(getCost(varName)) }}         </td>
            <td>{{ formatNumber(getSellCost(varName)) }}         </td>
            <td>{{ gameState.getDisplayName(varName) }} </td>
            <br>
    </tr>
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
