<template>
  <aside class="w-80 bg-white h-full flex flex-col">
    <!-- Logo Section -->
          <div class="p-4">
      <div class="flex items-center justify-center">
        <img 
          src="/geoint_logo.png" 
          alt="GeoINT Logo" 
          class="h-20 w-auto"
        />
      </div>
      <div class="text-center mt-2">
        <p class="text-xs text-gray-500 font-medium">SHAPING THE FUTURE OF WHERE</p>
      </div>
    </div>
    
    <!-- Navigation Buttons -->
    <div class="p-4 space-y-2">
      <button
        @click="setView('map')"
        :class="[
          'sidebar-button',
          isActive('map') ? 'active' : 'inactive'
        ]"
      >
        <div class="flex items-center space-x-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
          <span class="text-xl font-semibold">Map</span>
        </div>
      </button>
      
      <button
        @click="setView('pois')"
        :class="[
          'sidebar-button',
          isActive('pois') ? 'active' : 'inactive'
        ]"
      >
        <div class="flex items-center space-x-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
          </svg>
          <span class="text-xl font-semibold">POIs</span>
        </div>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useNavigation } from '../../composables/useNavigation'

const { setView, isActive } = useNavigation()
</script> 