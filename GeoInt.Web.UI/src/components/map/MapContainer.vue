<template>
  <div class="relative h-full w-full">
    <!-- Map Container -->
    <div ref="mapContainer" class="h-full w-full" />
    
    <!-- Loading Overlay -->
    <div v-if="!isLoaded && !error" class="absolute inset-0 bg-gray-100 flex items-center justify-center">
      <LoadingSpinner size="large" />
    </div>
    
    <!-- Error Overlay -->
    <div v-if="error" class="absolute inset-0 bg-red-50 flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-800 mb-2">Map Error</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="retryMap"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMap } from '../../composables/useMap'
import LoadingSpinner from '../common/LoadingSpinner.vue'

interface Props {
  center?: [number, number]
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [0, 0],
  zoom: 2
})

const mapContainer = ref<HTMLElement | null>(null)
const { map, isLoaded, error } = useMap(mapContainer, {
  center: props.center,
  zoom: props.zoom
})

const retryMap = () => {
  if (mapContainer.value) {
    window.location.reload()
  }
}

// Expose map instance for parent components
defineExpose({
  map,
  isLoaded,
  error
})
</script> 