<template>
  <div class="h-full flex flex-col">
    <!-- Map Controls -->
    <div class="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-semibold text-gray-900">Map View</h2>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">{{ filteredPOIs.length }} POIs shown</span>
          <div v-if="isLoading" class="spinner"></div>
        </div>
      </div>
      
      <!-- Category Filter Dropdown -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700">Filter by Category:</label>
        <select 
          v-model="selectedCategory" 
          @change="onCategoryChange"
          class="form-input w-48"
        >
          <option value="">All Categories</option>
          <option 
            v-for="category in availableCategories" 
            :key="category" 
            :value="category"
          >
            {{ category }}
          </option>
        </select>
        
        <button 
          @click="refreshMap"
          class="btn btn-secondary btn-sm"
          :disabled="isLoading"
        >
          <ArrowPathIcon class="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div class="flex-1 relative">
      <div 
        ref="mapContainer" 
        class="absolute inset-0 bg-gray-100"
      />
      
      <!-- Loading Overlay -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center z-10"
      >
        <div class="bg-white rounded-lg p-6 shadow-lg">
          <div class="flex items-center space-x-3">
            <div class="spinner"></div>
            <span class="text-sm text-gray-600">Loading POIs...</span>
          </div>
        </div>
      </div>

      <!-- Map Info Panel -->
      <div class="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 class="font-semibold text-gray-900 mb-2">Map Information</h3>
        <div class="space-y-1 text-sm text-gray-600">
          <div>Total POIs: {{ totalPOIs }}</div>
          <div>Visible POIs: {{ filteredPOIs.length }}</div>
          <div v-if="selectedCategory">
            Filter: {{ selectedCategory }}
          </div>
        </div>
        
        <!-- Category Legend -->
        <div v-if="availableCategories.length > 0" class="mt-3 pt-3 border-t border-gray-200">
          <h4 class="text-xs font-medium text-gray-700 mb-2">Category Colors</h4>
          <div class="space-y-1">
            <div 
              v-for="category in availableCategories.slice(0, 6)" 
              :key="category"
              class="flex items-center space-x-2 text-xs"
            >
              <div 
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: getCategoryColor(category) }"
              ></div>
              <span>{{ category }}</span>
            </div>
            <div v-if="availableCategories.length > 6" class="text-xs text-gray-500">
              +{{ availableCategories.length - 6 }} more
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import { useMap } from '../../composables/useMap';
import { usePOI } from '../../composables/usePOI';
import { useMessageStore } from '@/stores/messageStore';

// Refs
const mapContainer = ref<HTMLElement | null>(null);
const messageStore = useMessageStore();

// Composables
const { 
  loadPOIs, 
  filteredPOIs, 
  totalPOIs, 
  availableCategories,
  isLoading 
} = usePOI();

const { 
  initializeMap, 
  isMapLoaded, 
  selectedCategory,
  setCategoryFilter,
  refreshMap: refreshMapData,
  getCategoryColor
} = useMap(mapContainer);

// Computed
const refreshMap = async () => {
  try {
    await loadPOIs();
    await refreshMapData();
  } catch (error) {
    messageStore.showError('Failed to refresh map data');
  }
};

// Methods
const onCategoryChange = () => {
  setCategoryFilter(selectedCategory.value);
};

// Lifecycle
onMounted(async () => {
  try {
    // Load POI data first
    await loadPOIs();
    
    // Then initialize map
    await initializeMap();
  } catch (error) {
    messageStore.showError('Failed to initialize map');
  }
});

// Watch for POI data changes to update map
watch(
  () => filteredPOIs.value,
  () => {
    if (isMapLoaded.value) {
      // Map will automatically update due to reactive watch in useMap
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* Map container styles */
.map-container {
  font-family: 'Inter', sans-serif;
}

/* Custom scrollbar for legend */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style> 