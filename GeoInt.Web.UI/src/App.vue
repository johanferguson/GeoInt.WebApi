<template>
  <div id="app" class="h-screen bg-gray-50">
    <!-- Top Bar -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-900">GeoInt POI Manager</h1>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">{{ totalPOIs }} POIs</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex h-full">
      <!-- Sidebar Navigation -->
      <nav class="w-64 bg-white shadow-sm border-r border-gray-200">
        <div class="p-4">
          <ul class="space-y-2">
            <li>
              <router-link
                to="/"
                class="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                :class="{ 'bg-blue-50 text-blue-700': $route.name === 'map', 'text-gray-700': $route.name !== 'map' }"
              >
                <MapIcon class="w-5 h-5 mr-3" />
                Map
              </router-link>
            </li>
            <li>
              <router-link
                to="/poi"
                class="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                :class="{ 'bg-blue-50 text-blue-700': $route.name === 'poi', 'text-gray-700': $route.name !== 'poi' }"
              >
                <ListBulletIcon class="w-5 h-5 mr-3" />
                POI
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-hidden">
        <router-view />
      </main>
    </div>

    <!-- Message System -->
    <MessageContainer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MapIcon, ListBulletIcon } from '@heroicons/vue/24/outline';
import { usePOIStore } from '@/stores/poiStore';
import MessageContainer from './presentation/components/MessageContainer.vue';

const poiStore = usePOIStore();

const totalPOIs = computed(() => poiStore.getTotalCount);
</script>

<style scoped>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.router-link-active {
  @apply bg-blue-50 text-blue-700;
}
</style> 