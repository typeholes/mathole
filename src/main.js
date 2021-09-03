import { createApp } from 'vue'
import App from './components/App.vue'
import { createStore } from 'vuex'
import { VuexPersistence } from 'vuex-persist';

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

// Create a new store instance.
const store = createStore({
  state () {
    return {
      count: 0
    }
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  plugins: [vuexLocal.plugin],
})

const MyPlugin = {
    install(app, options) {
        app.config.globalProperties.$bubble = function $bubble(eventName, ...args) {
            // Emit the event on all parent components
            let component = this;
            do {
              component.$emit(eventName, ...args);
              component = component.$parent;
            } while (component);
          };        
    },
  };

let app = createApp(App);
app.use(MyPlugin);    
app.use(store);
app.mount('#app')
