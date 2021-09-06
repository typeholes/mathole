import { createStore, storeKey, useStore } from 'vuex'

import  { computed }  from 'vue';
import { VuexPersistence,  } from 'vuex-persist';

export class ST {
  static defs : { name: {init: any, mutations: {}, methods: {}}, onReset: (a,b)=>void} | {} = {};
  static _store: any ;
  static exportString: string = "";
  static vuexPersistence: VuexPersistence<any>;


  static addDef(name, init, mutations = {}, methods = {}, onReset) {    

    // add a save method if there are any mutations that are filtered
    if (Object.keys(mutations).find( (name) => name.startsWith("_"))) { 
      mutations['#save'] = (state) => { 
        return state[name] = state[name] ; 
      }
    }

    this.defs[name] = {};
    this.defs[name].init=init;
    this.defs[name].mutations = mutations;        
    this.defs[name].methods = methods;
    this.defs[name].onReset = onReset;


    return ST;
  } 

  static reset(state) {
    ST._store.commit("#Reset");
  }

  static init() {
    if (this._store) { throw( "ST already initialized"); }

    const vuexLocal = new VuexPersistence({
      storage: window.localStorage,
      reducer: (state) => { 
        var keep = Object.keys(state)
        .filter(key => !key.startsWith("_"))
        .reduce((obj, key) => {
          obj[key] = state[key];
          return obj;
        }, {});
        return keep;
      },
      filter: (mutation) => {
        return !mutation.type.match('^.*\._');
      },
      
    });
    ST.vuexPersistence=vuexLocal;

    var inits = {};
    var mutations = {}
    
    Object.keys(ST.defs).forEach( (name) => {  
      const descr = ST.defs[name];
      inits[name]=descr.init;
      Object.keys(ST.defs[name]['mutations']).forEach ( (method) => {
        mutations[ name + '.' + method ] = ST.defs[name]['mutations'][method];
      })
    })

    mutations["#Reset"] = (state)=> {
      Object.keys(ST.defs).forEach( (name) => {  
        const descr = ST.defs[name];
        state[name] = descr.init;
        var fn = ST.defs[name].onReset;
        if (fn) fn(state[name], state);
      });
    };    
  
    // Create a new store instance.
    
    const store = createStore({
      state () { return inits; },
      mutations: mutations,
      plugins: [vuexLocal.plugin],
    });
  
    // const hold = store.replaceState;
    // store.replaceState = (state)=> { console.log('replaceState called'); hold(state); };
    this._store = store;    
    return store;
  }

  static useState(...names) {
    const store = useStore();
    var ret = {};
    names.forEach( (name) => {
      if (!ST.defs[name]) throw "Unknown ST def: " + name;

      const dat = computed(() => store.state[name]);
      ret[name]={};
      ret[name].ref = dat;
      ret[name].value = ()=> dat.value;
  
      Object.keys(ST.defs[name]['mutations']).forEach ( (methodName) => {
        ret[name][methodName] = (args)=> {
          isObject(args) 
             ? store.commit({type: name + '.' + methodName, ...args})
             : store.commit(name + '.' + methodName, args);
        }
      });
      Object.keys(ST.defs[name]['methods']).forEach ( (methodName) => {
        ret[name][methodName] = (...args)=> {
          return ST.defs[name]['methods'][methodName](dat.value, ...args);          
        }
      });

    });
  
    return ret;
  }

  static saveAll() {
    Object.keys(ST.defs).forEach( (name =>{
      var mutations = ST.defs[name].mutations;
      var save = Object.keys(mutations).find( (mut) => mut == '#save');
      if (save) {
        ST._store.commit(name + '.' + save);
      }
    
    })
    );
  }

  static export() {
    ST.exportString = JSON.stringify(ST._store._state.data);
  }

  static import() {
   // ST._store._state.data = JSON.parse(ST.exportString);
   ST._store.replaceState(JSON.parse(ST.exportString));
  }

}




function isObject(obj) {
  return ({}).toString.apply(obj) === '[object Object]';
}
