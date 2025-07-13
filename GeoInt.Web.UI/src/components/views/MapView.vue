<template>
  <div class="h-full relative">
    <!-- Map Container -->
    <MapContainer 
      ref="mapContainer"
      :center="[0, 0]"
      :zoom="2"
      class="h-full"
    />
    
    <!-- Category Filter Panel -->
    <CategoryFilter 
      v-model="selectedCategory"
      v-if="mapContainer?.isLoaded"
    />
    
    <!-- POI Layer -->
    <POILayer
      v-if="mapContainer?.map && mapContainer?.isLoaded"
      :map="mapContainer.map"
      :is-map-loaded="mapContainer.isLoaded"
      :selected-category="selectedCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MapContainer from '../map/MapContainer.vue'
import CategoryFilter from '../map/CategoryFilter.vue'
import POILayer from '../map/POILayer.vue'

const mapContainer = ref<any>(null)
const selectedCategory = ref<string | null>(null)
</script> 