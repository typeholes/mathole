<script setup>

// import { inject, provide, ref} from 'vue';
// import GameVarView from './GameVarView.vue';
// import * as GameVar from '../js/GameVar';
// import { uiVars } from '../GameState';

// const varMap = ref ( uiVars );

// var selectedVarName = ref("t");
// var varObj = ref(varMap.t);

// const newVarName = ref(' ');

// function selectVar(event) {
//     selectedVarName.value=event.target.value;
//     varObj.value  = varMap[selectedVarName.value];
// }

// function runVarFunction(name) {
//     const gameVar = varMap[selectedVarName.value];
//     if (!gameVar) { return 0; }
//     var ret = "";
//     try {
//         ret =  name == 'valueMathFunction' ? GameVar.getValue(gameVar, varMap) : GameVar.getCost(gameVar, varMap) ;
//     } 
//     catch(err) {ret = err }
//     return ret;
// }


// function getField(name) {
//     const gameVar = varMap[selectedVarName.value];
//     const ret = gameVar && gameVar[name]; 
//     if (typeof ret === 'function') return 'function';
//     return ret;
// }


// function getArray(name) {
//     const gameVar = varMap.value()[selectedVarName.value];
//     const ret = gameVar && gameVar[name]; 
//     return JSON.stringify(ret);
// }

// function update(event, name, src='value') {
//     var value = event.target[src];
//     varMap.setVarField( {varName: selectedVarName.value, name: name, value: value});        
//     // clear the actual functions when the function names change so they will get rebuilt
//     // probably should be on the action
//     if (name == 'costFn' || name == 'costArgs') {
//         varMap.setVarField( {varName: selectedVarName.value, name: 'costMathFunction', value: null});        
//     }
//     if (name == 'valueFn'|| name == 'valueArgs') {
//         varMap.setVarField( {varName: selectedVarName.value, name: 'valueMathFunction', value: null});        
//     }    
// }

// function updateArray(event, name, src='value') {
//     var value = event.target[src];
//     var json = JSON.parse(value);
//     varMap.setVarField( {varName: selectedVarName.value, name: name, value: json});        
// }

// function addNewVar() {
//     if (!newVarName.value) return;
//     const name = newVarName.value.trim();
//     if (!name) return;
//     varMap.addVar(newVarName.value);
// }

</script>

<template>

<!--   <div>
    <input type="text" v-model="newVarName">
     new name: {{ newVarName }}
    <button @click="addNewVar">Add Var</button>
    <select  :value="selectedVarName" @change="selectVar">
    <option v-for="(_, varName) in varMap.value()" :value="varName"> {{ varName }} </option>
    </select>
    <div >


        
        DisplayName <input type="text" :value="getField('displayName')" @change="update($event, 'displayName')">
        buyable <input type="checkbox" :checked="getField('buyable')" @change="update($event, 'buyable', 'checked')">
        visible <input type="checkbox" :checked="getField('visible')" @change="update($event, 'visible', 'checked')">
        Count bought <input type="text" :value="getField('cntBought')" @change="update($event, 'cntBought')">
        cost function <select :value="getField('costFn')" @change="update($event, 'costFn')" ><option v-for=" (_, fn) in functionDefMap.value()" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('costArgs')" @change="updateArray($event, 'costArgs')"> {{ getField('costMathFunction') }} {{ runVarFunction('costMathFunction') }}
        value function <select :value="getField('valueFn')" @change="update($event, 'valueFn')" ><option v-for=" (_, fn) in functionDefMap.value()" :value="fn"> {{fn}} </option></select>
        args <input type="text" :value="getArray('valueArgs')" @change="updateArray($event, 'valueArgs')"> {{ getField('valueMathFunction') }} {{ runVarFunction('valueMathFunction') }}       
    </div>
  </div>
 --></template>

<style >
button {
  background-color: #dee7a7;
}
button.selected {
  background-color: #9342b9;
}
</style>
