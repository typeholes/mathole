
window.global = global;

import { createApp} from 'vue'
import App from './components/App.vue'


import * as GameVar from './js/GameVar'

import { setVariable } from './js/mathUtil';

import { ST } from './js/ST';

import { initialState } from './initialState';

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
    } catch(err) {console.log(err)}
  }
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
  
  setField(state, args) {
    state.functionDefMap[args.defName][args.fieldName]=args.value;
  },
    
  }, {

  },
  
);


let app = createApp(App);
app.use(ST.init());
app.mount('#app')

