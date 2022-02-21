<script setup>

import { planckConstantDependencies } from 'mathjs';
import { inject, provide, ref} from 'vue';
import * as FunctionDef from '../js/FunctionDef';

import { addFunction, runString } from '../js/mathUtil';

import { ST } from '../js/ST';

import { plot } from '../js/plot';

const { functionDefMap } = ST.useState( 'functionDefMap' ); 

var selectedDefName = ref("sin");

const newDefName = ref(' ');

const definitionResult = ref('Not Run');

const testString = ref(' ');

const testGraphExpr = ref('x');

const testResult = ref(' ');

function runTest(event) {
   testString.value = event.target.value;
   testResult.value = runString(testString.value);
}


function runTestGraph(event) {
   testGraphExpr.value = event.target.value;
   plot( '#test-graph-expr', testGraphExpr.value);
}


function selectDef(event) {
    selectedDefName.value=event.target.value;    
}

function getField(name) {
    const functionDef = functionDefMap.value()[selectedDefName.value];
    const ret = functionDef && functionDef[name]; 
    return ret;
}

function getArray(name) {
    const functionDef = functionDefMap.value()[selectedDefName.value];
    const ret = functionDef && functionDef[name]; 
    return JSON.stringify(ret);
}

function tryDefinition(name) {
  addFunction( selectedDefName.value, getField('args'), getField('def'));

  const def = functionDefMap.value()[selectedDefName.value];
  const result = FunctionDef.runDefinition(def);
  definitionResult.value = result;
  return result;
}

function update(event, name, src='value') {
    var value = event.target[src];
    functionDefMap.setField( {defName: selectedDefName.value, fieldName: name, value: value});        
    tryDefinition();
}

function updateArray(event, name, src='value') {
    var value = event.target[src];
    var json = JSON.parse(value);
    functionDefMap.setField( {defName: selectedDefName.value, fieldName: name, value: json});        
    tryDefinition();
}

function addNewDef() {
    if (!newDefName.value) return;
    const name = newDefName.value.trim();
    if (!name) return;
    functionDefMap.addDef(name);
    selectedDefName.value = name;
}

</script>

<template>
  <div>
    <input type="text" v-model="newDefName">
    <br> new name: {{ newDefName }}<br>
    <button @click="addNewDef">Add Function Definition</button><br>
    <select  :value="selectedDefName" @change="selectDef">
    <option v-for="(_, defName) in functionDefMap.value()" :value="defName"> {{ defName }} </option>
    </select>
    <div >
        builtin <input type="checkbox" :checked="getField('builtin')" @change="update($event, 'builtin', 'checked')"><br>
        definition <input type="text" size="50" :value="getField('def')" @change="update($event, 'def')"><br>
        args <input type="text" :value="getArray('args')" @change="updateArray($event, 'args')"><br>
        {{ definitionResult }}<br><br>
        Test Expression <input type="text" :value="testString" @change="runTest($event)"><br>
        {{ testResult }} <br>

        Graph  <input type="text"  :value="testGraphExpr" @change="runTestGraph($event)"><br>
        <div id='test-graph-expr' class="graphDiv"></div>

<!-- <br>
        definition <input type="text" :value="getField('def')" @change="update($event, 'def')">
        builtin <input type="checkbox" :checked="getField('builtin')" @change="update($event, 'builtin', 'checked')">
        visible <input type="checkbox" :checked="getField('visible')" @change="update($event, 'visible', 'checked')">
        <br>cost function <select :value="getField('costFn')" @change="update($event, 'costFn')" ><option v-for=" (_, fn) in GameVar.fnMap" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('args')" @change="updateArray($event, 'args')">
        <br>value function <select :value="getField('valueFn')" @change="update($event, 'valueFn')" ><option v-for=" (_, fn) in GameVar.fnMap" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('valueArgs')" @change="updateArray($event, 'valueArgs')">         -->
    </div>
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
