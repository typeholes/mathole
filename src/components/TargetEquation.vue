<script setup>

import * as Eq  from '../js/Eq';

import EqNodeView from './EqNodeView.vue';
import EqOpView from './EqOpView.vue';
import EqVarView from './EqVarView.vue';
import displayExpr from "../js/mathUtil";

import { makeViewMap } from "../js/makeViewMap";

import { provide, inject, ref, toRefs } from 'vue';

import { ST } from '../js/ST';

const props = defineProps({
    id: String,
})

const { id } = toRefs(props);

const { equation, targetEquation, _selectedVar, _selectedOp } = ST.useState ( 'equation', 'targetEquation', '_selectedVar', '_selectedOp' );

function combineEquation() {
    if (! (_selectedVar.value()['varName'] && _selectedOp.value()['op'])) return equation.value();
    if (equation.value() != targetEquation.value()) return targetEquation.value();        
    var newEq = Eq.newEqOp(equation.value(), _selectedOp.value().op, _selectedVar.value());
    targetEquation.set( newEq);
    return Eq.newEq;
}

const getView = makeViewMap(inject, provide, id.value, _selectedVar.value, 
    [Eq.EqEmpty__type,EqNodeView], 
    [Eq.EqVar__type,EqVarView], 
    [Eq.EqOp__type,EqOpView],
);


</script>

<template>
    <table border="1">
        <tr>
            <td>
                <component :is="getView(targetEquation.value().component)" :src="combineEquation()" ></component>
            </td>
            <td>
                <button @click="equation.setToTarget">Accept Equation</button>
            </td>
        </tr>
        <tr >
            <td colspan="2">
                <div>
                    selected: {{ _selectedVar.value()  }}
                    <br />
                    <!-- <div> selected: {{ selected }} <br> -->
                    Pretty:
                    <div id="target-pretty"></div>
                    <br />Pretty Val:
                    <div id="target-pretty-val"></div>
                    <br />Derivative:
                    <div id="target-derivative"></div>Derivative Val:
                    <div id="target-derivative-val"></div>
                </div>
            </td>
        </tr>
    </table>
</template>

<style scoped>
a {
    color: #42b983;
}
</style>
