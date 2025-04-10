// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './style.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.config.globalProperties = {
    taskId: 0,
};

app.use(router).use(store).use(ElementPlus).mount('#app');