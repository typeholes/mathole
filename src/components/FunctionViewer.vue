<script setup lang="ts">

import { ref } from 'vue';
import { plot } from '../js/plot';
import { expand, M } from '../js/mathUtil';

let expr = ref("x");
let displayExpr = ref("x");

function showGraph() {
  let node = M.parse(expr.value);
  let expanded : string = expand(node, true, {}).toString();
 
  plot('#view-fn-graph-expr', expanded, '0');

  displayExpr.value = expand(node, true, {}, 1).toString();
}

function replaceWithExpanded() {
    expr.value = displayExpr.value;
    showGraph();
}
</script>

<template>
  <div>

    function: <input v-model="expr" @change="showGraph" size="50" ><br>

    expanded: {{ displayExpr }} <br>
    <button @click="replaceWithExpanded">replace with expanded</button>
    <div id='view-fn-graph-expr' class="graphDiv"></div>
  
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
