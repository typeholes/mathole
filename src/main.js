import { createApp } from 'vue'
import App from './components/App.vue'


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
app.mount('#app')
