
<script setup lang="ts">
import { shallowRef, onMounted } from 'vue'

import Game from './Game.vue';
import FunctionViewer from './FunctionViewer.vue';

import { GameState } from '../js/GameState';

import { ref } from 'vue';

import { gameSetup } from "../js/MarketGame";

import ToggleButton  from './ToggleButton.vue';
import { PropKeys, provides } from './types';

const _varMap = ref( 
  GameState.init
  (  ref( {} )
  , (m) => m.value 
  , (m,n) => m.value[n] = { cost:0, value: 0}
  , (m,n) => m.value[n].cost
  , (m,n, cost) => m.value[n].cost = cost
  , (m,n) => m.value[n].value
  , (m,n, value) => m.value[n].value = value
  , gameSetup
  )
);

const gameState = GameState.getInstance();

const { clickAction, graphedVarName, selectedVarName, dependencies, dependents } = provides(
  [ PropKeys.ClickAction, "select" ],
  [ PropKeys.GraphedVarName, "" ],
  [ PropKeys.SelectedVarName, "" ],
  [ PropKeys.Dependencies, [] ],
  [ PropKeys.Dependents, [] ]
);

function dbg() { 
  const foo = [
    clickAction, graphedVarName, selectedVarName, dependencies, dependents 
  ];
  debugger;
}

const mode = shallowRef(Game);

function setMode(newMode) {
  mode.value = newMode;
}

const deltaDisplay = ref(0);

let priorTime = 0;
function loop(elapsedTime) {
  const delta = elapsedTime - priorTime
  if (gameState.canTick && delta >= 500) {
    gameState.tick(delta/10000);
    priorTime = elapsedTime;
    deltaDisplay.value = Math.floor(delta);
  } 
  window.requestAnimationFrame(loop);
}

onMounted( ()=> { 
  console.log('mounted ' );
  window.requestAnimationFrame( loop);
}
);


async function doImport() {
  // const getJsonUpload = () =>
  //   new Promise(resolve => {
  //     const inputFileElement = document.createElement('input')
  //     inputFileElement.setAttribute('type', 'file')
  //     inputFileElement.setAttribute('multiple', 'false')
  //     inputFileElement.setAttribute('accept', '.json')
      
  //     inputFileElement.addEventListener(
  //       'change',
  //       async (event) => {
  //         const { files } = event.target
  //         if (!files) {
  //           return
  //         }

  //         const filePromises = [...files].map(file => file.text())

  //         resolve(await Promise.all(filePromises))
  //       },
  //       false,
  //     )
  //     inputFileElement.click()
  //   })
  
  //     const jsonFiles = await getJsonUpload();
  // ST.exportString = jsonFiles[0];
  // ST.import();
  // Object.values(functionDefMap.value()).forEach( (def)=> FunctionDef.runDefinition(def));
  // Object.values(varMap.value()).forEach( (gameVar)=> 
  //   setVariable(gameVar.name, gameVar.cntBought)
  //   );
}

function doExport() {
  // function download(file, text) {
              
  //               //creating an invisible element
  //               var element = document.createElement('a');
  //               element.setAttribute('href', 
  //               'data:text/plain;charset=utf-8, '
  //               + encodeURIComponent(text));
  //               element.setAttribute('download', file);
              
  //               // Above code is equivalent to
  //               // <a href="path of file" download="file name">
              
  //               document.body.appendChild(element);
              
  //               //onClick property
  //               element.click();
              
  //               document.body.removeChild(element);
  //           }

  // ST.export();
  // download('mathole.json',ST.exportString);

}


</script>

<template>
todo
   <table width="100%" border="1">
    <tr>
      <td>
        <button @click="setMode(Game)">Game</button>
        <!-- <button @click="setMode(VarEditor)">VarEditor</button>
        <button @click="setMode(FunctionDefEditor)">FunctionDefEditor</button>
        <button><a href="https://youtu.be/akT0wxv9ON8?t=30">Help</a></button> -->
        <button @click="gameState.save">save</button>
        <button @click="gameState.load">load</button>
        <button @click="setMode(FunctionViewer)">Function Viewer</button>
    <!-- <button @click="doExport">export</button>
        <button @click="doImport">import</button>
        <button @click="ST.reset">reset</button>         -->
      </td>
      <td rowspan="3" width="10%">
        Click Action <ToggleButton labelOn="Select" labelOff="Graph" valueOn="select" valueOff="graph" v-model:value="clickAction"></ToggleButton>

        <!-- <button @click="dbg">debugger</button> -->
      </td>
    </tr>
    <tr>
      <td>
        <keep-alive>
          <component :is="mode" v-model:selectedVarName="selectedVarName" v-model:graphedVarName="graphedVarName"></component>        
        </keep-alive>
      </td>
    </tr>
    <tr>
      <td>
  <!--      <span class="error">{{ _errorMessage.value() }}</span> -->
      </td>
    </tr>
  </table>
 

</template>

<style scoped>
a {
  color: #000000;
}

span.error {
  color: #c70404
}
</style>
