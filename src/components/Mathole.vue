<script setup>
import { ref, shallowRef, provide, readonly, computed } from 'vue'
import EquationMaker from './EquationMaker.vue';
import Game from './Game.vue';
import VarEditor from './VarEditor.vue';
import FunctionDefEditor from './FunctionDefEditor.vue';


import { ST } from '../js/ST';
import * as FunctionDef from '../js/FunctionDef';



const props = defineProps({
})

const mode = shallowRef(EquationMaker);

function setMode(newMode) {
  mode.value = newMode;
}

const { functionDefMap } = ST.useState( 'functionDefMap' );

const { lastTime, count, _count2 } = ST.useState( 'lastTime', 'count', '_count2' );

async function doImport() {
  const getJsonUpload = () =>
    new Promise(resolve => {
      const inputFileElement = document.createElement('input')
      inputFileElement.setAttribute('type', 'file')
      inputFileElement.setAttribute('multiple', 'false')
      inputFileElement.setAttribute('accept', '.json')
      
      inputFileElement.addEventListener(
        'change',
        async (event) => {
          const { files } = event.target
          if (!files) {
            return
          }

          const filePromises = [...files].map(file => file.text())

          resolve(await Promise.all(filePromises))
        },
        false,
      )
      inputFileElement.click()
    })
  
      const jsonFiles = await getJsonUpload();
  ST.exportString = jsonFiles[0];
  ST.import();
  Object.values(functionDefMap.value()).forEach( (def)=> FunctionDef.runDefinition(def));
}

function doExport() {
  function download(file, text) {
              
                //creating an invisible element
                var element = document.createElement('a');
                element.setAttribute('href', 
                'data:text/plain;charset=utf-8, '
                + encodeURIComponent(text));
                element.setAttribute('download', file);
              
                // Above code is equivalent to
                // <a href="path of file" download="file name">
              
                document.body.appendChild(element);
              
                //onClick property
                element.click();
              
                document.body.removeChild(element);
            }

  ST.export();
  download('mathole.json',ST.exportString);
}
// window.setInterval(()=>lastTime.tick, 500);

// window.setInterval(count._increment, 500);
// window.setInterval(_count2.double, 5000);


</script>

<template>
  <table width="100%" border="1">
    <tr>
      <td>
        <button @click="setMode(EquationMaker)">Equation</button>
        <button @click="setMode(Game)">Game</button>
        <button @click="setMode(VarEditor)">VarEditor</button>
        <button @click="setMode(FunctionDefEditor)">FunctionDefEditor</button>
        <button><a href="https://youtu.be/akT0wxv9ON8?t=30">Help</a></button>
        {{ count.ref }}
        {{ _count2.ref }}
        <button @click="ST.saveAll">save</button>
        <button @click="doExport">export</button>
        <button @click="doImport">import</button>
        <button @click="ST.reset">reset</button>
      </td>
    </tr>
    <tr>
      <td >
        <keep-alive>
          <component :is="mode"></component>        
        </keep-alive>
      </td>
    </tr>
  </table>
  

</template>

<style scoped>
a {
  color: #000000;
}
</style>
