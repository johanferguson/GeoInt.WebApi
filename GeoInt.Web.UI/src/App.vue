<template>
  <div id="app">
    <header class="top-bar">
      <h1 class="app-title">GeoInt POI Manager</h1>
    </header>

    <div class="app-layout">
      <nav class="sidebar-nav">
        <button 
          @click="currentView = 'map'"
          :class="{ active: currentView === 'map' }"
          class="nav-item"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5M15 19l-6-2.11V5l6 2.11V19z"/>
          </svg>
          Map
        </button>
        <button 
          @click="currentView = 'pois'"
          :class="{ active: currentView === 'pois' }"
          class="nav-item"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          POI Data
        </button>
      </nav>

      <main class="main-section">
        <MapView v-if="currentView === 'map'" />
        <POITable v-else-if="currentView === 'pois'" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapView from '@/components/Map/MapView.vue';
import POITable from '@/components/POI/POITable.vue';

const currentView = ref<'map' | 'pois'>('map');
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 1.25rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-title {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.app-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sidebar-nav {
  width: 320px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

.nav-item {
  display: flex;
  align-items: center;
  width: calc(100% - 2rem);
  padding: 1.25rem 1.5rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 1rem;
  border-radius: 12px;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
}

.nav-item:hover {
  background: #add8e6;
}

.nav-item.active {
  background: #2c3e50;
  color: white;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.3);
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.main-section {
  flex: 1;
  overflow: hidden;
  background: #ffffff;
}
</style> 