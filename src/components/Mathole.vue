
<script setup lang="ts">
import VsplitterVue from './Vsplitter.vue';


import Vsplitter from './Vsplitter.vue';
import Game from './Game.vue';

import { GameState } from '../js/GameState';

import { onMounted, ref } from 'vue';

import { gameSetup } from "../js/MarketGame";

import { init as UiInit, onUiMounted, uiState, uiStateMethods, sidebarComponent, Globals, setMode, gotoPriorMode, engineCallbacks, showHelp, defaultExtraVarFields } from './uiUtil';

import Options from './Options.vue';
import Dependencies from './Dependencies.vue';
import Graph from './Graph.vue';
import Milestones from './Milestones.vue';
import Story from './Story.vue';
import Sidebars from './Sidebars.vue';
import Help from './Help.vue';

GameState.init ( uiState , uiStateMethods, defaultExtraVarFields, gameSetup, engineCallbacks);

const gameState = GameState.getInstance();

UiInit( {
  Options: Options,
  Dependencies: Dependencies, 
  Graph : Graph,
  Milestones : Milestones,
  Story : Story,
  Sidebars : Sidebars,
  Help : Help
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

const gameCollapsed = ref ( false );

</script>

<template>
  <div class="mathole">
    <Vsplitter left-col-spec="1fr" right-col-spec="300px" v-model:collapsed="gameCollapsed">
      <template #left>
        <Game></Game>
      </template>
      <template #right>
        <div class="sideTopbar">
          <button @click="gotoPriorMode()"> &#8592</button>
          {{ Globals.sidebarMode }} 
          <button @click="setMode('Sidebars')"> &#8801</button>
          
          <!-- <div @mouseenter="showHelp()" @mouseleave="gotoPriorMode()" class="helpicon" @touchstart="showHelp()"  @touchend="gotoPriorMode()"  @touchcancel="gotoPriorMode()"  @click=";"> ? </div> -->
          <div @pointerenter="showHelp()" @pointerleave="gotoPriorMode()" class="helpicon"> ? </div>
    <!--         Click Action <ToggleButton labelOn="Select" labelOff="Graph" valueOn="select" valueOff="graph" v-model:value="clickAction"></ToggleButton> -->
        </div>
        <div class="sidebar">
            <keep-alive>
              <component :is="sidebarComponent()"></component>        
            </keep-alive>
        </div>
      </template>
    </Vsplitter>

  </div>

</template>

<style >
a {
  color: #000000;
}

span.error {
  color: #c70404
}

.helpicon {
  border-radius: 100%; 
  float: right; 
  border-width: 2px;
  background-color: rgb(255, 164, 164);
  touch-action: none;
  width: 10%
}

</style>
