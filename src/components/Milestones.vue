<script setup lang="ts">

import Milestone from './Milestone.vue';
import { GameState } from '../js/GameState';

const gameState = GameState.getInstance();

</script>

<template>
  <div class="milestones">
    <div class="contents" v-for="(name) in gameState.getMilestoneNames()">
      <Milestone :name="name"></Milestone>
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
