
<script setup>
import { ref, shallowRef, provide, readonly, computed, onErrorCaptured, onMounted } from 'vue'
import EquationMaker from './EquationMaker.vue';
import Game from './Game.vue';
import VarEditor from './VarEditor.vue';
import FunctionDefEditor from './FunctionDefEditor.vue';


import { ST } from '../js/ST';
import * as FunctionDef from '../js/FunctionDef';
import { setVariable } from '../js/mathUtil';




const props = defineProps({
})

const mode = shallowRef(EquationMaker);

function setMode(newMode) {
  mode.value = newMode;
}



const { functionDefMap, varMap } = ST.useState( 'functionDefMap', 'varMap' );

const { lastTime, _errorMessage } = ST.useState( 'lastTime', '_errorMessage' );

onMounted( ()=> { 
  console.log('mounted ' + lastTime.value() );
  Object.values(functionDefMap.value()).forEach( (def)=> FunctionDef.runDefinition(def));
  Object.values(varMap.value()).forEach( (gameVar)=> 
    setVariable(gameVar.name, gameVar.cntBought)
    );
}
);


onErrorCaptured( (err) => {
      console.log('captured error');
//      debugger;
      console.log(err);
      _errorMessage.set(err);
      return false;
});


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
  Object.values(varMap.value()).forEach( (gameVar)=> 
    setVariable(gameVar.name, gameVar.cntBought)
    );
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
 window.setInterval(lastTime.tick, 500);



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
    <tr>
      <td>
        <span class="error">{{ _errorMessage.value() }}</span>
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
