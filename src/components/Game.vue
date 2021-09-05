<script setup>

import { inject, provide, ref} from 'vue';
import GameVarView from './GameVarView.vue';
import { ST } from '../js/ST';

const { varMap, score, constant } = ST.useState( 'varMap', 'score', 'constant' ); 

</script>

<template>
  <div>
    <h1> Score: {{ score.value() }} </h1>
    constant: {{ constant }}
  <div v-for="(_, varName) in varMap.value()">
      <GameVarView :varName="varName"></GameVarView>
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
</style>
