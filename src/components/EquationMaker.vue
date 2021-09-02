<script setup>

import { inject, provide, ref} from 'vue';
import EqNode from '../js/EqNode';
import EqOp from '../js/EqOp';
import EqVar from '../js/EqVar';
import Equation from './Equation.vue';
import TargetEquation from './TargetEquation.vue';

const root = ref(new EqVar('t','t',0));

const root2 = ref ( new  EqOp( new EqVar('a','a',1), '+', new EqVar('b','b',2)));

const selectedTerm = ref(new EqNode);

const selectedVar = ref(new EqNode);

function combineSelected() {
    if (selectedTerm.value.component != EqOp.component || selectedVar.value.component != EqVar.component) {
        return root.value;
    }
    return new EqOp( root.value, selectedTerm.value.op, selectedVar.value);
}

function handleTermVarSelection(selected) {
    if (!selected) return;
    if (selected.component == EqOp.component) {
        selectedTerm.value = selected;
    }
    if (selected.component == EqVar.component) {
        selectedVar.value = selected;
    }
    root2.value = combineSelected();
}

provide('handleTermVarSelection',handleTermVarSelection);

function acceptEquation() { 
    root.value = combineSelected();
}

</script>

<template>
  <div>
      <Equation :root="root" id="equation"></Equation>
      <TargetEquation :root="root2" id="equation-target" :accept-equation="()=>acceptEquation()"></TargetEquation>
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
