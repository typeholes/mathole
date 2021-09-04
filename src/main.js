import { createApp } from 'vue'
import App from './components/App.vue'

import * as Eq  from './js/Eq';

import { ST } from './js/ST';

const timeVar = Eq.newEqVar('Time', 't', 0, false);

const dummyNode = Eq.newEqEmpty();

ST.addDef('timeVar', timeVar, {
  _increment: (state) => { return state.timeVar.value++; },
})

ST.addDef('equation', timeVar, {
  set: (state, equation) => { return state.equation = equation; },
  setToTarget: (state) => { 
    state._selectedOp = dummyNode; 
    state._selectedVar = dummyNode; 
    return state.equation = state.targetEquation; 
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
  set: (state, op) => { state.targetEquation = state.equation; return state._selectedOp = op; },
  clear: (state)=> { state._selectedOp = dummyNode; },
}, {
  isSelected: (value, checkAgainst) => value == checkAgainst ? "selected" : "",
});

ST.addDef('_selectedVar', Eq.newEqEmpty(), {
  set: (state, _var) => { state.targetEquation = state.equation; return state._selectedVar = _var; },
  clear: (state)=> { state._selectedOp = dummyNode; },
}, {
  isSelected: (value, checkAgainst) => value == checkAgainst ? "selected" : "",
});

ST.addDef('varList', [timeVar], {
  addVar: (state) => {
    const cnt = state.varList.length + 1;
    const newVar = Eq.newEqVar('Var ' + cnt, 'var'+cnt, cnt);
    state.varList.push( newVar);
    return newVar;
  }
});

ST.addDef( 'count', 0 ,{
  _increment: (state) => { return state.count++; },
});

ST.addDef( '_count2', 1 ,{
double: (state) => { return state._count2*=2; },
});

let app = createApp(App);
app.use(ST.init());
app.mount('#app')
