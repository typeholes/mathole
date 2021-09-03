import { createApp } from 'vue'
import App from './components/App.vue'


import { ST } from './js/ST';




ST.addDef( 'count', 0 ,{
  increment: (state) => { state.count++; },
});

ST.addDef( 'count2', 1 ,{
double: (state) => { state.count2*=2; },
});

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
app.use(ST.init());
app.mount('#app')
