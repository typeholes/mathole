import { createApp } from 'vue'
import App from './components/App.vue'

import * as Eq  from './js/Eq';

import * as GameVar from './js/GameVar'

import { displayExpr, evalEquation } from "./js/mathUtil";

import { ST } from './js/ST';

const timeEqVar = Eq.newEqVar('t');
const timeGameVar = GameVar.newGameVar('Time', 0, false, true, GameVar.fId, [], GameVar.fId, [])
const dummyNode = Eq.newEqEmpty();


ST.addDef('lastTime', Date.now(), {
  tick: (state) => {
    var newTime = Date.now();
    var diff = newTime - state.lastTime;
    state.lastTime = newTime;
    state.varMap['t'].cntBought += diff/10000;
    state.score = evalEquation(state.equation, state.varMap, state.constant);
  }
});

ST.addDef('score', 0, {

});

ST.addDef('equation', timeEqVar, {
  set: (state, equation) => { return state.equation = equation; },
  setToTarget: (state) => { 
    state._selectedOp = dummyNode; 
    state._selectedVar = "";   
    state.equation = state.targetEquation; 
    displayEquationStrings(state._selectedVar, state);
    return state.equation;
  },
});

ST.addDef('targetEquation', timeEqVar, {
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
//    console.log( value, checkAgainst ); debugger;
    return value.varName == checkAgainst.varName ? "selected" : ""
  },
});

ST.addDef('varMap', {t: timeGameVar}, {
  addVar: (state,name) => {
    const cnt = Object.keys(state.varMap).length + 1;
    var varName = name || 'var'+cnt;
    const newGameVar = GameVar.newGameVar(varName, 0, true, true, GameVar.fId, [], GameVar.fId, []);
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
      state.varMap.t.cntBought=0;
      state.varMap[varName].cntBought++;        
    }
  },
  setVarField(state, args) {
    state.varMap[args.varName][args.name]=args.value;
  },
  setCostFn(state, args) {
    state.varMap[args.varName].cost=args.costFn;
  },
  setDisplayName(state, args) {
    state.varMap[args.varName].displayName=args.displayName;
  },
  setBuyable(state,args) {
    state.varMap[args.varName].buyable=args.buyable;
  },
  setVisible(state,args) {
    state.varMap[args.varName].visible=args.visible;
  },
    
  }, {

  },
  (varMap) => varMap.t.cntBought=0
);

ST.addDef( 'count', 0 ,{
  _increment: (state) => { return state.count++; },
});

ST.addDef( '_count2', 1 ,{
double: (state) => { return state._count2*=2; },
});

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

