<script setup>

import { ref} from 'vue';

import { runString, displayFunction } from '../js/mathUtil';


import { plot } from '../js/plot';

// var selectedDefName = ref("sin");

// const testResult = ref(' ');

// function display() {
//   const argNames = getField('args');
//   const values = getField('argValues');
//   const args = Object.fromEntries(zip( argNames, values));
//   const allSet = values.every( (x) => typeof x !== 'undefined' );

//   if (allSet) {
//     displayFunction(selectedDefName.value,'fn-', '#test-graph-expr', args);  
//   }
// }

// function selectDef(event) {
//   selectedDefName.value=event.target.value;  
//   display();
// }

// function getField(name) {
//     const functionDef = functionDefMap.value()[selectedDefName.value];
//     const ret = functionDef && functionDef[name]; 
//     return ret;
// }

// function getArgValue(idx) {
//   let values =  getField('argValues');
//   if (typeof values === 'undefined') {
//     values = getField('args').map( ()=>'1');
//     functionDefMap.setField('argValues', values);
//   } 

//   let value = values[idx];

//   if (typeof value === 'undefined') {
//     setArgValue( {value: '1'}, idx);
//     return '1';
//   }

//   return value;

// }

// function setArgValue( event, idx) {
//   var value = event.target.value.trim();
//   let field = getField('argValues');
//   field[idx] = value;
//   functionDefMap.setField( {defName: selectedDefName.value, fieldName: 'argValues', value: field});        
//   display();

// }

</script>

<template>
   todo
<!--   <div>
    <select  :value="selectedDefName" @change="selectDef">
    <option v-for="(_, defName) in functionDefMap.value()" :value="defName"> {{ defName }} </option>
    </select>
    <div >

                      <div>

                    Pretty:
                    <div id="fn-pretty"></div>
                    <br />Pretty Val:
                    <div id="fn-pretty-val"></div>
                    <br />Derivative:
                    <div id="fn-derivative"></div>Derivative Val:
                    <div id="fn-derivative-val"></div>
                </div>


        args
     <ul v-for="(arg, idx) in getField('args')"> 
         <li> {{ arg }} <input type="text" :value="getArgValue(idx)" @change="setArgValue($event, idx)"> </li>
     </ul> 
        Result: {{ testResult }} <br>
        <div id='test-graph-expr' class="graphDiv"></div>

    </div>
  </div> -->
</template>

<style scoped>
button {
  background-color: #dee7a7;
}
button.selected {
  background-color: #9342b9;
}
</style>
