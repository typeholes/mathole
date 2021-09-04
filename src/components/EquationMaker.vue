<script setup>

import { inject, provide, ref} from 'vue';
import * as Eq  from '../js/Eq';

import Equation from './Equation.vue';
import TargetEquation from './TargetEquation.vue';

import { ST } from '../js/ST';

const { equation, targetEquation, _selectedOp, _selectedVar } = 
    ST.useState( 'equation', 'targetEquation', '_selectedOp', '_selectedVar');

function combineSelected() {
    if (selectedTerm.value.component != Eq.EqOp__type || selectedVar.value.component != Eq.EqVar__type) {
        return root.value;
    }
    return Eq.newEqOp( root.value, selectedTerm.value.op, selectedVar.value);
}

function handleTermVarSelection(selected) {
    if (!selected) return;
    if (selected.component == Eq.EqOp__type) {
        selectedTerm.set(selected);
    }
    if (selected.component == Eq.EqVar__type) {
        selectedVar.set(selected);
    }
    targetEquation.set(combineSelected());
}

function acceptEquation() { 
    equation.set( targetEquation.value ) ;
}

</script>

<template>
  <div>
      <Equation id="equation"></Equation>
      <TargetEquation id="equation-target" ></TargetEquation>
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
