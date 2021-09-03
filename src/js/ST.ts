import { createStore, useStore } from 'vuex'
import { computed } from 'vue';
import { VuexPersistence } from 'vuex-persist';


export class ST {
  static defs : { name: {init: any, mutations: {}}} | {} = {};
  static _store: any ;

  static addDef(name, init, mutations) {    
    this.defs[name] = {};
    this.defs[name].init=init;
    this.defs[name].mutations = mutations;        


    return ST;
  } 

  static init() {
    if (this._store) { throw( "ST already initialized"); }

    const vuexLocal = new VuexPersistence({
      storage: window.localStorage,
      filter: (mutation) => {
        return true;
      }
    });

    var inits = {};
    var mutations = {}
    Object.keys(ST.defs).forEach( (name) => {  
      const descr = ST.defs[name];
      inits[name]=descr.init;
      Object.keys(ST.defs[name]['mutations']).forEach ( (method) => {
        mutations[ name + '.' + method ] = ST.defs[name]['mutations'][method];
      })
    })
  
    // Create a new store instance.
    const store = createStore({
      state () { return inits; },
      mutations: mutations,
      plugins: [vuexLocal.plugin],
    });
  
    this._store = store;    
    return store;
  }

  static useState(...names) {
    const store = useStore();
    var ret = {};
    names.forEach( (name) => {
      const dat = computed(() => store.state[name]);
      ret[name]={};
      ret[name].ref = dat;
      ret[name].value = ()=> dat.value;
  
      Object.keys(ST.defs[name]['mutations']).forEach ( (methodName) => {
        ret[name][methodName] = (...args)=> {
          store.commit(name + '.' + methodName, ...args);
        }
      });
    });
  
    return ret;
  }
}


