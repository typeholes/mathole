
<script setup lang="ts">
import { shallowRef, onMounted, reactive } from 'vue'

import Game from './Game.vue';
import FunctionViewer from './FunctionViewer.vue';

import { GameState } from '../js/GameState';

import { ref } from 'vue';

import { gameSetup } from "../js/MarketGame";

import ToggleButton  from './ToggleButton.vue';
import { PropKeys, provides, uiState, uiStateMethods } from './uiUtil';

const _varMap = ref( 
  GameState.init
  ( uiState 
  , uiStateMethods
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
  <div class="mathole">
    <div class="topbar">
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
    </div>
    <div class="sidebar">
          Click Action <ToggleButton labelOn="Select" labelOff="Graph" valueOn="select" valueOff="graph" v-model:value="clickAction"></ToggleButton>

          <!-- <button @click="dbg">debugger</button> -->
    </div>
    <div class="mainPain">
        <keep-alive>
          <component :is="mode" v-model:selectedVarName="selectedVarName" v-model:graphedVarName="graphedVarName"></component>        
        </keep-alive>
    </div>

  </div>

</template>

<style >
a {
  color: #000000;
}

span.error {
  color: #c70404
}

.mathole {
  display: grid;
  grid-auto-columns: minmax(content,1fr);
  gap: 10px;
  grid-auto-rows: minmax(100px, auto);

}

.topbar {
  grid-row: 1;
  grid-column: 1-2;
}

.sidebar {
grid-column: 2;
grid-row: 2;
}

.mainPain {
  grid-row: 2;
  grid-column: 1;

}

</style>
