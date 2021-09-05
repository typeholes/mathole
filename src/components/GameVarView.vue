<script setup>

import { toRefs } from '@vue/reactivity';
import { ST } from '../js/ST';
import * as GameVar from '../js/GameVar';

defineProps({
    varName: null,
})


const { varMap } = ST.useState( 'varMap' );

</script>

<template>
    <div :v-if="varMap.value()[varName] && varMap.value()[varName].visible">    
        {{ varMap.value()[varName].displayName }}: {{ Math.round(GameVar.getValue(varMap.value()[varName])*100)/100 }} 
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
