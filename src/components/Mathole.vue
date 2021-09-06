<script setup>
import { ref, shallowRef, provide, readonly, computed } from 'vue'
import EquationMaker from './EquationMaker.vue';
import Game from './Game.vue';
import VarEditor from './VarEditor.vue';


import { ST } from '../js/ST';



const props = defineProps({
})

const mode = shallowRef(EquationMaker);

function setMode(newMode) {
  mode.value = newMode;
}


const { lastTime, count, _count2 } = ST.useState( 'lastTime', 'count', '_count2' );


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
        <button><a href="https://youtu.be/akT0wxv9ON8?t=30">Help</a></button>
        {{ count.ref }}
        {{ _count2.ref }}
        <button @click="ST.saveAll">save</button>
        <button @click="ST.export">export</button>
        <button @click="ST.import">import</button>
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
