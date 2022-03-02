
<script setup lang="ts">

import { Ref, ref } from 'vue';

import { GameState } from '../js/GameState';

interface Props {
  label: string,
  state: boolean
}


const emit = defineEmits<{
  (e: 'update:state', state: boolean): void
}>();


const props = defineProps<Props>();

</script>

<template>
    <button :class="{toggled: state}" @click="$emit('update:state', !state)">{{label}}</button>
</template>

<style scoped>
.toggled  {
  background-color: #9342b9; 
}
button {
  background-color: #dee7a7;
}
</style>