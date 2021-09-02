<script setup>

import EqVar from "../js/EqVar.ts";
import EqOp from "../js/EqOp.ts";
import EqNode from "../js/EqNode.ts";
import EqNodeView from './EqNodeView.vue';
import EqOpView from './EqOpView.vue';
import EqVarView from './EqVarView.vue';
import displayExpr from "../js/mathUtil";
import TermViewVue from "./TermView.vue";

import { provide, inject, ref, toRefs } from 'vue';
import { string } from "mathjs";

const props = defineProps({
    root: EqNode,
    id: String,
})

const { root, id } = toRefs(props);

var selected = ref(new EqNode());

function handleSelection(e, l_root = root, l_selected = selected) {
    selected.value = e;
    var val = l_root.value;
    if (root) displayExpr(val.eqString(), val.valString(e.eqString()), e.eqString());
}

const appGetView = inject('getView');
const appAddViewMap = inject('addViewMap');

appAddViewMap(id.value, EqNode.component,EqNodeView);
appAddViewMap(id.value, EqVar.component,EqVarView);
appAddViewMap(id.value, EqOp.component,EqOpView);

function getView(componentId) { return appGetView(id.value, componentId); }

provide('handleSelection', handleSelection);
provide('viewMapKey', id);
provide('getView', getView);


</script>

<template>
    <table border="1">
        <tr>
            <td>
                <component :is="EqOpView" :src="root"></component>
            </td>
            <td>
                <TermViewVue></TermViewVue>
            </td>
        </tr>
        <tr >
            <td colspan="3">
                <div>
                    selected: {{ selected.eqString() }}
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
