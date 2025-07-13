<template>
  <div class="h-full relative">
    <!-- Map Container -->
    <MapContainer 
      ref="mapContainer"
      :center="[0, 0]"
      :zoom="2"
      class="h-full"
      :class="{ 'add-mode-cursor': isAddMode }"
    />
    
    <!-- Category Filter Panel -->
    <CategoryFilter 
      v-model="selectedCategory"
      v-if="mapContainer?.isLoaded"
    />
    
    <!-- Add POI Button -->
    <AddPOIButton 
      :is-add-mode="isAddMode"
      @toggle-add-mode="toggleAddMode"
      v-if="mapContainer?.isLoaded"
    />
    
    <!-- POI Layer -->
    <POILayer
      v-if="mapContainer?.map && mapContainer?.isLoaded"
      :map="mapContainer.map"
      :is-map-loaded="mapContainer.isLoaded"
      :selected-category="selectedCategory"
      :is-add-mode="isAddMode"
      @coordinates-selected="handleCoordinatesSelected"
    />
    
    <!-- POI Form Modal -->
    <POIFormModal
      :is-visible="showPOIForm"
      :coordinates="selectedCoordinates || [0, 0]"
      @close="handleFormClose"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MapContainer from '../map/MapContainer.vue'
import CategoryFilter from '../map/CategoryFilter.vue'
import POILayer from '../map/POILayer.vue'
import AddPOIButton from '../map/AddPOIButton.vue'
import POIFormModal from '../map/POIFormModal.vue'
import { usePOI } from '../../composables/usePOI'

const { createPOI } = usePOI()

const mapContainer = ref<any>(null)
const selectedCategory = ref<string | null>(null)
const isAddMode = ref(false)
const selectedCoordinates = ref<[number, number] | null>(null)
const showPOIForm = ref(false)

const toggleAddMode = () => {
  isAddMode.value = !isAddMode.value
  if (!isAddMode.value) {
    selectedCoordinates.value = null
    showPOIForm.value = false
  }
}

const handleCoordinatesSelected = (coordinates: [number, number]) => {
  selectedCoordinates.value = coordinates
  showPOIForm.value = true
}

const handleFormClose = () => {
  showPOIForm.value = false
  selectedCoordinates.value = null
}

const handleFormSubmit = async (data: { name: string; category: string; coordinates: [number, number] }) => {
  try {
    await createPOI({
      name: data.name,
      category: data.category,
      long: data.coordinates[0],
      lat: data.coordinates[1]
    })
    
    // Close form and exit add mode
    showPOIForm.value = false
    isAddMode.value = false
    selectedCoordinates.value = null
    
    // Show success toast (center screen)
    const showToast = (window as any).showToast
    if (showToast) {
      showToast(`"${data.name}" has been added successfully`, 'success')
    }
    
  } catch (error) {
    console.error('Error creating POI:', error)
    // Show error toast
    const showToast = (window as any).showToast
    if (showToast) {
      showToast('Failed to add POI. Please try again.', 'error')
    }
  }
}
</script>

<style scoped>
.add-mode-cursor {
  cursor: crosshair !important;
}

.add-mode-cursor :deep(.maplibregl-canvas) {
  cursor: crosshair !important;
}
</style> 