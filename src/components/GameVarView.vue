<script setup>

import { toRefs } from '@vue/reactivity';
import { ST } from '../js/ST';

defineProps({
    idx: null,
})


const { varList } = ST.useState( 'varList' );

</script>

<template>
    <div>
        {{ varList.value()[idx].displayName }}: {{ Math.round(varList.value()[idx].value*100)/100 }} {{ varList.value()[idx].buyable }}
        <button @click="varList.incrementValue(idx)" v-if="varList.value()[idx].buyable">
            buy
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
