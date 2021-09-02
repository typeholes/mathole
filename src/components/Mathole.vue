<script setup>
import { ref } from 'vue'
import EquationMaker from './EquationMaker.vue';
import EqVar from "../js/EqVar.ts";
import EqOp from "../js/EqOp.ts";
import EqNode from "../js/EqNode.ts";


const props = defineProps({
    msg: String,
    root: EqNode,
})

</script>

<template>

  <EquationMaker></EquationMaker>

</template>

<style scoped>
a {
  color: #42b983;
}
</style>
