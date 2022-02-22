
window.global = global;

import { createApp, computed } from 'vue'
import App from './components/App.vue'


import * as Eq  from './js/Eq';

import * as GameVar from './js/GameVar'

import * as FunctionDef from './js/FunctionDef';

import { displayExpr, evalEquation } from "./js/mathUtil";

import { setVariable } from './js/mathUtil';

import { ST } from './js/ST';

import { initialState } from './initialState';

const timeGameVar = GameVar.newGameVar('t', 'Time', 0, false, true, GameVar.fId, [], GameVar.fId, [])
const dummyNode = Eq.newEqEmpty();

ST.addDef('_errorMessage', "", {
  set: (state,message) => {
    state._errorMessage = message;
  }
});

ST.addDef('lastTime', Date.now(), {
  tick: (state) => {
    try {
    var newTime = Date.now();
    var diff = newTime - state.lastTime;
    state.lastTime = newTime;
    if (typeof state.varMap['t'].cntBought !== 'number') {state.varMap['t'].cntBought = Number.parseFloat(state.varMap['t'].cntBought)}
    state.varMap['t'].cntBought += diff/10000;
    state.score = evalEquation(state.equation, state.varMap, state.constant);
    } catch(err) {console.log(err)}
  }
});

ST.addDef('score', 0, {

});

ST.addDef('equation', initialState.equation, {
  set: (state, equation) => { return state.equation = equation; },
  setToTarget: (state) => { 
    state._selectedOp = dummyNode; 
    state._selectedVar = "";   
    state.equation = state.targetEquation; 
    displayEquationStrings(state._selectedVar, state);
    return state.equation;
  },
});

ST.addDef('targetEquation', initialState.equation, {
  set: (state, targetEquation) => { return state.targetEquation = targetEquation; },
});


ST.addDef('termList', [
  Eq.newEqOp( Eq.newEqEmpty(), "+",  Eq.newEqEmpty() ),
  Eq.newEqOp( Eq.newEqEmpty(), "*",  Eq.newEqEmpty() ),
  Eq.newEqOp( Eq.newEqEmpty(), "^",  Eq.newEqEmpty() ),
], {

});

ST.addDef('constant', 0, {});

ST.addDef('_selectedOp', Eq.newEqEmpty(), {
  set: (state, op) => { 
    state.targetEquation = state.equation; 
    displayEquationStrings(state._selectedVar, state);
    return state._selectedOp = op; 
  },
  clear: (state)=> { state._selectedOp = dummyNode; },
}, {
  isSelected: (value, checkAgainst) => value == checkAgainst ? "selected" : "",
});

ST.addDef('_selectedVar', Eq.newEqEmpty(), {
  set: (state, _var) => { 
    state.targetEquation = state.equation; 
    displayEquationStrings(_var, state);
    return state._selectedVar = _var; 
  },
  clear: (state)=> { state._selectedOp = dummyNode; },
  displayEquations: (state) => displayEquationStrings(state._selectedVar, state),
}, {
  isSelected: (value, checkAgainst) => {
    return value.varName == checkAgainst.varName ? "selected" : ""
  },
});

ST.addDef('varMap', initialState.varMap, {
  addVar: (state,name) => {
    const cnt = Object.keys(state.varMap).length + 1;
    var varName = name || 'var'+cnt;
    const newGameVar = GameVar.newGameVar(varName, varName, 0, true, true, GameVar.fId, [], GameVar.fId, []);
    state.varMap[varName]= newGameVar;
    return newGameVar;
  },
  buy: (state, varName) => {
    var varObj  = state.varMap[varName];
    var cost = GameVar.getCost(varObj);
    if (state.score >= cost) {
      state.constant = state.score - cost;
  //    state.constant = 0;
      state.score = 0;
      state.varMap.t.cntBought=.001;
      state.varMap[varName].cntBought++;        
      setVariable(varName, state.varMap[varName].cntBought);
    }
  },
  setVarField(state, args) {
    state.varMap[args.varName][args.name]=args.value;
    if (args.name == 'cntBought') { setVariable(args.varName, args.value); }
  },

  }, {

    getVarValue( map, varName, dummy) {    
      return GameVar.getValue(map[varName]);
  }

  },
  (varMap) => varMap.t.cntBought=0
);


ST.addDef('functionDefMap', initialState.functionDefMap, {
  addDef: (state,name) => {        
    const newDef = FunctionDef.newFunctionDef(name, true, ['a','b'], ['x',2], '');
    state.functionDefMap[name]= newDef;
    return newDef;
  },
  setField(state, args) {
    state.functionDefMap[args.defName][args.fieldName]=args.value;
  },
    
  }, {

  },
  
);


let app = createApp(App);
app.use(ST.init());
app.mount('#app')

function displayEquationStrings(_var, state) {
  var varName = _var.varName;
  var str = Eq.eqString(state.equation);
  var valStr = Eq.valString(state.equation, state.varMap, [varName]);
  var targetStr = Eq.eqString(state.targetEquation);
  var targetValStr = Eq.valString(state.targetEquation, state.varMap, [varName]);
  displayExpr(str, valStr, varName || 't', "");
  displayExpr(targetStr, targetValStr, varName || 't', "target-");
}

