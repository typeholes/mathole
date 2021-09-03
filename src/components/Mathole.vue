<script setup>
import { ref, shallowRef, provide, readonly, computed } from 'vue'
import EquationMaker from './EquationMaker.vue';
import Game from './Game.vue';
import EqVar from '../js/EqVar';

import { ST } from '../js/ST';



const props = defineProps({
})

const mode = shallowRef(EquationMaker);

function setMode(newMode) {
  mode.value = newMode;
}

const varCount = ref(0);
const varList = ref([new EqVar('Time', 't', 0, false)]);

function addVar() { 
    console.log(['add var', varList.value]);
    varCount.value++;
    var num = varCount.value.toString();
    varList.value.push(new EqVar('Var ' + num, 'var' + num, varCount.value ));
}

provide('addVar',addVar);
provide('varList', varList);
provide('timeVar', readonly(ref(varList.value[0])));

const { count, _count2 } = ST.useState( 'count', '_count2' );

window.setInterval(()=>varList.value[0].value++, 500);

window.setInterval(count._increment, 500);
window.setInterval(_count2.double, 5000);


</script>

<template>
  <table width="100%" border="1">
    <tr>
      <td>
        <button @click="setMode(EquationMaker)">Equation</button>
        <button @click="setMode(Game)">Game</button>
        <button><a href="https://youtu.be/akT0wxv9ON8?t=30">Help</a></button>
        {{ count.ref }}
        {{ _count2.ref }}
        <button @click="ST.saveAll">save</button>
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
