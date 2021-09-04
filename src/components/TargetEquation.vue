<script setup>

import * as Eq  from '../js/Eq';

import EqNodeView from './EqNodeView.vue';
import EqOpView from './EqOpView.vue';
import EqVarView from './EqVarView.vue';

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
    return newEq;
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
                <!-- TODO: untangle this gnarly state manipulation.  We should not change state on display and the logic should be moved out of the view -->
                <component :is="combineEquation() && getView(targetEquation.value().__type)" :src="targetEquation.value()" ></component>
                <!-- <component :is="getView(combineEquation().__type)" :src="combineEquation()" ></component> -->
            </td>
            <td>
                <button @click="equation.setToTarget">Accept Equation</button>
            </td>
        </tr>
        <tr >
            <td colspan="2">
                <div>
                    selected: {{ Eq.eqString(_selectedVar.value())  }}
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
