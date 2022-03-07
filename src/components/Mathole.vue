
<script setup lang="ts">

import Game from './Game.vue';

import { GameState } from '../js/GameState';

import { onMounted } from 'vue';

import { gameSetup } from "../js/MarketGame";

import { init as UiInit, onUiMounted, uiState, uiStateMethods, sidebarComponent, Globals, setMode, gotoPriorMode, engineCallbacks } from './uiUtil';

import Options from './Options.vue';
import Dependencies from './Dependencies.vue';
import Graph from './Graph.vue';
import Milestones from './Milestones.vue';
import Story from './Story.vue';
import Sidebars from './Sidebars.vue';

GameState.init ( uiState , uiStateMethods , gameSetup, engineCallbacks);

const gameState = GameState.getInstance();

UiInit( {
  Options: Options,
  Dependencies: Dependencies, 
  Graph : Graph,
  Milestones : Milestones,
  Story : Story,
  Sidebars : Sidebars
}, gameState);

let priorTime = 0;
function loop(elapsedTime) {
  const delta = elapsedTime - priorTime
  if (gameState.canTick && delta >= 500) {
    gameState.tick(delta/10000);
    priorTime = elapsedTime;
  } 
  window.requestAnimationFrame(loop);
}

onMounted( ()=> { 
  onUiMounted();
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
      <div class="topBar">
        <button @click="gotoPriorMode()"> &#8592</button>{{ Globals.sidebarMode }} <button @click="setMode('Sidebars')"> &#8801</button>
 <!--         Click Action <ToggleButton labelOn="Select" labelOff="Graph" valueOn="select" valueOff="graph" v-model:value="clickAction"></ToggleButton> -->
      </div>
    <div class="sidebar">
        <keep-alive>
          <component :is="sidebarComponent()"></component>        
        </keep-alive>
    </div>
    <div class="mainPain">
      <Game></Game>
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
  grid-template-columns: auto 300px;
  gap: 10px;
  grid-auto-rows: 20px auto;

}

.topbar {
  grid-row: 1;
  grid-column: 2;
}

.sidebar {
grid-column: 2;
grid-row: 2;
}

.mainPain {
  grid-row: 1/2;
  grid-column: 1;

}

</style>
