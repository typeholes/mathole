<script setup>

import { toRefs, computed } from '@vue/reactivity';
import { ST } from '../js/ST';
import * as GameVar from '../js/GameVar';

defineProps({
    varName: null,
})


const { varMap } = ST.useState( 'varMap' );

const time = computed ( () => varMap.value['t']);

</script>

<template>
    <div :v-if="varMap.value()[varName] && varMap.value()[varName].visible">    
        {{ varMap.value()[varName].displayName }}: {{ Math.round(GameVar.getValue(varMap.value()[varName], time)*100)/100 }}         
        <button @click="varMap.buy(varName)" v-if="varMap.value()[varName].buyable">
            Cost: {{ GameVar.getCost(varMap.value()[varName]) }}
        </button> <br>
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
