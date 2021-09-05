import { createApp } from 'vue'
import App from './components/App.vue'

import * as Eq  from './js/Eq';

import { displayExpr, evalEquation } from "./js/mathUtil";

import { ST } from './js/ST';

const timeVar = Eq.newEqVar(0, 'Time', 't', 0, false);

const dummyNode = Eq.newEqEmpty();


ST.addDef('lastTime', Date.now(), {
  tick: (state) => {
    var newTime = Date.now();
    var diff = newTime - state.lastTime;
    state.lastTime = newTime;
    state.varList[0].value += diff/10000,880;
    state.score = evalEquation(state.equation, state.varList);
  }
});

ST.addDef('score', 0, {

});

ST.addDef('timeVar', timeVar, {
  _increment: (state) => { return state.timeVar.value++; },
})

ST.addDef('equation', timeVar, {
  set: (state, equation) => { return state.equation = equation; },
  setToTarget: (state) => { 
    state._selectedOp = dummyNode; 
    state._selectedVar = dummyNode;   
    state.equation = state.targetEquation; 
    displayEquationStrings(state._selectedVar, state);
    return state.equation;
  },
});

ST.addDef('targetEquation', timeVar, {
  set: (state, targetEquation) => { return state.targetEquation = targetEquation; },
});


ST.addDef('termList', [
  Eq.newEqOp( Eq.newEqEmpty(), "+",  Eq.newEqEmpty() ),
  Eq.newEqOp( Eq.newEqEmpty(), "*",  Eq.newEqEmpty() ),
  Eq.newEqOp( Eq.newEqEmpty(), "^",  Eq.newEqEmpty() ),
], {

});

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
  isSelected: (value, checkAgainst) => value == checkAgainst ? "selected" : "",
});

ST.addDef('varList', [timeVar], {
  addVar: (state) => {
    const cnt = state.varList.length + 1;
    const newVar = Eq.newEqVar(cnt-1, 'Var ' + cnt, 'var'+cnt, cnt);
    state.varList.push( newVar);
    return newVar;
  },
  incrementValue: (state, idx) => {
    state.varList[idx].value++;
  }
  }, {

  },
  (varList) => varList[0].value=0
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
  var valStr = Eq.valString(state.equation, state.varList, [varName]);
  var targetStr = Eq.eqString(state.targetEquation);
  var targetValStr = Eq.valString(state.targetEquation, state.varList, [varName]);
  displayExpr(str, valStr, varName || 't', "");
  displayExpr(targetStr, targetValStr, varName || 't', "target-");
}

