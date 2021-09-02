<script setup>
import { ref } from 'vue'
import Equation from './Equation.vue';
import EqVar from "../js/EqVar.ts";
import EqOp from "../js/EqOp.ts";
import EqNode from "../js/EqNode.ts";


const props = defineProps({
    msg: String,
    root: EqNode,
})

const count = ref(0)
</script>

<template>

  <!-- <h1>{{ root }}</h1> -->
  <Equation :root="root"></Equation>

</template>

<style scoped>
a {
  color: #42b983;
}
</style>
