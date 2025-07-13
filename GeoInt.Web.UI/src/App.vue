<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <AppSidebar />
      
      <!-- Main Content -->
      <main class="flex-1 overflow-hidden">
        <MapView v-if="currentView === 'map'" />
        <POIView v-if="currentView === 'pois'" />
        <TestView v-if="currentView === 'test'" />
      </main>
    </div>
    
    <!-- Notifications -->
    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
import { useNavigation } from './composables/useNavigation'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import MapView from './components/views/MapView.vue'
import POIView from './components/views/POIView.vue'
import TestView from './components/views/TestView.vue'
import NotificationToast from './components/common/NotificationToast.vue'

const { currentView } = useNavigation()
</script> 