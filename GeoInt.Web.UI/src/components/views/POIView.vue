<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold text-gray-900">Points of Interest</h1>
            <p class="text-xl text-gray-600 mt-2">Manage and view all POI data</p>
          </div>
          <div class="flex space-x-4">
            <!-- Export Buttons -->
            <button
              @click="exportToCSV"
              :disabled="isExporting"
              class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50 transition-all duration-200"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export CSV
            </button>
            <button
              @click="exportToGeoJSON"
              :disabled="isExporting"
              class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50 transition-all duration-200"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              Export GeoJSON
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Container with Constrained Width -->
    <div class="flex-1 overflow-hidden">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <POITable />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePOI } from '../../composables/usePOI'
import { useNotifications } from '../../composables/useNotifications'
import POITable from '../table/POITable.vue'

const { getPOIsAsGeoJson } = usePOI()
const { showSuccess, showError } = useNotifications()

// Local state
const isExporting = ref(false)

// Export methods
const exportToCSV = async () => {
  isExporting.value = true
  try {
    const response = await fetch('/api/v1/pois/csv')
    if (!response.ok) {
      throw new Error('Failed to export CSV')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'pois.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    showSuccess('CSV exported successfully')
  } catch (error) {
    showError('Failed to export CSV')
  } finally {
    isExporting.value = false
  }
}

const exportToGeoJSON = async () => {
  isExporting.value = true
  try {
    const geoJsonData = await getPOIsAsGeoJson()
    
    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], { 
      type: 'application/json' 
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'pois.geojson'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    showSuccess('GeoJSON exported successfully')
  } catch (error) {
    showError('Failed to export GeoJSON')
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
/* Corporate styling overrides */
.bg-gray-50 {
  background-color: #f8fafc;
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Professional spacing and typography */
h1 {
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
  letter-spacing: -0.025em;
}

p {
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}

/* Export buttons styling */
.inline-flex {
  min-width: 160px;
  justify-content: center;
}
</style> 