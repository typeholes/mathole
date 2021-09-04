<script setup>

import * as Eq  from '../js/Eq';

import EqNodeView from './EqNodeView.vue';
import EqOpView from './EqOpView.vue';
import EqVarView from './EqVarView.vue';
import TermView from "./TermView.vue";
import VarView from "./VarView.vue";
import { makeViewMap } from "../js/makeViewMap";

import { provide, inject, ref, toRefs } from 'vue';

import { ST } from '../js/ST';

const props = defineProps({    
    id: String,
})

const { id } = toRefs(props);

const { equation, _selectedVar } = ST.useState( 'equation', '_selectedVar' );

const getView = makeViewMap(inject, provide, id.value, _selectedVar.value(), 
    [Eq.EqEmpty__type,EqNodeView], 
    [Eq.EqVar__type,EqVarView], 
    [Eq.EqOp__type,EqOpView],
);


</script>

<template>
    <table border="1">
        <tr>
            <td>
                <component :is="getView(equation.value().__type)" :src="equation.value()" ></component>
            </td>
            <td>
                <TermView id="term-view"></TermView>
            </td>
            <td>
                <VarView id="var-view"></VarView>
            </td>
        </tr>
        <tr >
            <td colspan="3">
                <div>
                    selected: {{ Eq.eqString(equation.value()) }}
                    <br />
                    <!-- <div> selected: {{ selected }} <br> -->
                    Pretty:
                    <div id="pretty"></div>
                    <br />Pretty Val:
                    <div id="pretty-val"></div>
                    <br />Derivative:
                    <div id="derivative"></div>Derivative Val:
                    <div id="derivative-val"></div>
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
