import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router'; // <-- Importamos el router
import App from './App.vue';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router); // <-- Le decimos a Vue que lo use
app.mount('#app');