<script setup>

import { inject, provide, ref} from 'vue';
import GameVarView from './GameVarView.vue';
import * as GameVar from '../js/GameVar';

import { ST } from '../js/ST';

const { varMap } = ST.useState( 'varMap' ); 

var selectedVarName = ref("t");
var varObj = ref(varMap.value()['t']);

const newVarName = ref(' ');

function selectVar(event) {
    selectedVarName.value=event.target.value;
    varObj.value  = varMap.value()[selectedVarName.value];
}

function getField(name) {
    const gameVar = varMap.value()[selectedVarName.value];
    const ret = gameVar && gameVar[name]; 
    return ret;
}

function getArray(name) {
    const gameVar = varMap.value()[selectedVarName.value];
    const ret = gameVar && gameVar[name]; 
    return JSON.stringify(ret);
}

function update(event, name, src='value') {
    var value = event.target[src];
    varMap.setVarField( {varName: selectedVarName.value, name: name, value: value});        
}

function updateArray(event, name, src='value') {
    var value = event.target[src];
    var json = JSON.parse(value);
    varMap.setVarField( {varName: selectedVarName.value, name: name, value: json});        
}

function addNewVar() {
    if (!newVarName.value) return;
    const name = newVarName.value.trim();
    if (!name) return;
    varMap.addVar(newVarName.value);
}

</script>

<template>
  <div>
    <input type="text" v-model="newVarName">
    <br> new name: {{ newVarName }}<br>
    <button @click="addNewVar">Add Var</button><br>
    <select  :value="selectedVarName" @change="selectVar">
    <option v-for="(_, varName) in varMap.value()" :value="varName"> {{ varName }} </option>
    </select>
    <div >
        <!-- selected: {{  selectedVarName }}<br> -->
        <!-- {{ varObj }} -->
        <br>
        DisplayName <input type="text" :value="getField('displayName')" @change="update($event, 'displayName')">
        buyable <input type="checkbox" :checked="getField('buyable')" @change="update($event, 'buyable', 'checked')">
        visible <input type="checkbox" :checked="getField('visible')" @change="update($event, 'visible', 'checked')">
        <br>cost function <select :value="getField('costFn')" @change="update($event, 'costFn')" ><option v-for=" (_, fn) in GameVar.fnMap" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('costArgs')" @change="updateArray($event, 'costArgs')">
        <br>value function <select :value="getField('valueFn')" @change="update($event, 'valueFn')" ><option v-for=" (_, fn) in GameVar.fnMap" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('valueArgs')" @change="updateArray($event, 'valueArgs')">        
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
