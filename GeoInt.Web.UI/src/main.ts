import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

// Import views
import MapView from './presentation/views/MapView.vue';
import POIView from './presentation/views/POIView.vue';

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'map',
      component: MapView
    },
    {
      path: '/poi',
      name: 'poi',
      component: POIView
    }
  ]
});

// Create app
const app = createApp(App);

// Use plugins
app.use(createPinia());
app.use(router);

// Mount app
app.mount('#app'); 