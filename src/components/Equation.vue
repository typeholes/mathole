<script setup>

import EqVar from "../js/EqVar.ts";
import EqOp from "../js/EqOp.ts";
import EqNode from "../js/EqNode.ts";
import EqNodeView from './EqNodeView.vue';
import EqOpView from './EqOpView.vue';
import EqVarView from './EqVarView.vue';
import displayExpr from "../js/mathUtil";
import TermViewVue from "./TermView.vue";
import VarViewVue from "./VarView.vue";
import { makeViewMap } from "../js/makeViewMap";

import { provide, inject, ref, toRefs } from 'vue';

const props = defineProps({    
    root: null,
    id: String,
})

const { root, id } = toRefs(props);

var selected = ref(new EqNode);

function handleSelection(e, l_root = root, l_selected = selected) {
    if (!l_selected) return;
    l_selected.value = e;
    var val = l_root.value;    
    if (val) {
        if (e) {
            displayExpr(val.eqString(), val.valString(e.eqString()), e.eqString());
        } else {
            displayExpr(val.eqString(), val.valString(""), "t");
        }
    } 
}

const getView = makeViewMap(inject, provide, id.value, handleSelection, selected, 
    [EqNode.component,EqNodeView], 
    [EqVar.component,EqVarView], 
    [EqOp.component,EqOpView],
);


</script>

<template>
    <table border="1">
        <tr>
            <td>
                <component :is="getView(root.component)" :src="root" ></component>
            </td>
            <td>
                <TermViewVue id="term-view"></TermViewVue>
            </td>
            <td>
                <VarViewVue id="var-view"></VarViewVue>
            </td>
        </tr>
        <tr >
            <td colspan="3">
                <div>
                    selected: {{ selected && selected.eqString() }}
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
