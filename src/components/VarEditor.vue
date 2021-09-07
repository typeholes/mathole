<script setup>

import { inject, provide, ref} from 'vue';
import GameVarView from './GameVarView.vue';
import * as GameVar from '../js/GameVar';

import { ST } from '../js/ST';

const { varMap, functionDefMap } = ST.useState( 'varMap', 'functionDefMap' ); 

var selectedVarName = ref("t");
var varObj = ref(varMap.value()['t']);

const newVarName = ref(' ');

function selectVar(event) {
    selectedVarName.value=event.target.value;
    varObj.value  = varMap.value()[selectedVarName.value];
}

function runVarFunction(name) {
    const gameVar = varMap.value()[selectedVarName.value];
    if (!gameVar) { return 0; }
    var ret = "";
    try {
        ret =  name == 'valueMathFunction' ? GameVar.getValue(gameVar) : GameVar.getCost(gameVar) ;
    } 
    catch(err) {ret = err }
    return ret;
}


function getField(name) {
    const gameVar = varMap.value()[selectedVarName.value];
    const ret = gameVar && gameVar[name]; 
    if (typeof ret === 'function') return 'function';
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
    // clear the actual functions when the function names change so they will get rebuilt
    // probably should be on the action
    if (name == 'costFn') {
        varMap.setVarField( {varName: selectedVarName.value, name: 'costMathFunction', value: null});        
    }
    if (name == 'valueFn') {
        varMap.setVarField( {varName: selectedVarName.value, name: 'valueMathFunction', value: null});        
    }    
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
        Count bought <input type="text" :value="getField('cntBought')" @change="update($event, 'cntBought')">
        <br>cost function <select :value="getField('costFn')" @change="update($event, 'costFn')" ><option v-for=" (_, fn) in functionDefMap.value()" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('costArgs')" @change="updateArray($event, 'costArgs')"> {{ getField('costMathFunction') }} {{ runVarFunction('costMathFunction') }}
        <br>value function <select :value="getField('valueFn')" @change="update($event, 'valueFn')" ><option v-for=" (_, fn) in functionDefMap.value()" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('valueArgs')" @change="updateArray($event, 'valueArgs')"> {{ getField('valueMathFunction') }} {{ runVarFunction('valueMathFunction') }}       
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
