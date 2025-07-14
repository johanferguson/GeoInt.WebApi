<template>
  <div class="h-full bg-gray-50 flex flex-col">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Points of Interest</h1>
            <p class="text-sm text-gray-600 mt-1">Manage and view all POI data</p>
          </div>
          <div class="flex space-x-3">
            <!-- Export Buttons -->
            <button
              @click="exportToCSV"
              :disabled="isExporting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export CSV
            </button>
            <button
              @click="exportToGeoJSON"
              :disabled="isExporting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              Export GeoJSON
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Controls -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <!-- Add Button -->
          <button
            @click="startAddingPOI"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-geoint-600 hover:bg-geoint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New POI
          </button>

          <!-- Search -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search POIs..."
              class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-geoint-500 focus:border-geoint-500"
            />
          </div>

          <!-- Import CSV -->
          <div class="relative">
            <input
              ref="csvFileInput"
              type="file"
              accept=".csv"
              @change="handleCSVImport"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button
              :disabled="isImporting"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              Import CSV
            </button>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedPOIs.length > 0" class="flex items-center space-x-3">
          <span class="text-sm text-gray-700">
            {{ selectedPOIs.length }} selected
          </span>
          <button
            @click="showBulkDeleteConfirmation"
            class="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete Selected
          </button>
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="flex-1 overflow-hidden">
      <POITable
        :pois="filteredPOIs"
        :is-loading="isLoading"
        :selected-pois="selectedPOIs"
        :is-adding="isAddingPOI"
        @select-poi="togglePOISelection"
        @select-all="toggleSelectAll"
        @sort="handleSort"
        @edit="handleEdit"
        @delete="handleDelete"
        @save="handleSave"
        @cancel="handleCancel"
        @add-save="handleAddSave"
        @add-cancel="handleAddCancel"
      />
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div v-if="showBulkDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-5">Delete Selected POIs</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete {{ selectedPOIs.length }} POI(s)? This action cannot be undone.
            </p>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button
              @click="cancelBulkDelete"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              @click="confirmBulkDelete"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePOI } from '../../composables/usePOI'
import { useNotifications } from '../../composables/useNotifications'
import { POI } from '../../entities/POI'
import POITable from '../map/POITable.vue'

const { 
  pois, 
  isLoading, 
  isImporting, 
  isDeleting,
  loadPOIs, 
  createPOI, 
  updatePOI, 
  deletePOI,
  importFromCSV,
  getPOIsAsGeoJson
} = usePOI()

const { showSuccess, showError } = useNotifications()

// Local state
const searchTerm = ref('')
const selectedPOIs = ref<string[]>([])
const showBulkDeleteModal = ref(false)
const isAddingPOI = ref(false)
const isExporting = ref(false)
const csvFileInput = ref<HTMLInputElement | null>(null)
const sortField = ref<keyof POI | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

// Computed properties
const filteredPOIs = computed(() => {
  let filtered = pois.value

  // Apply search filter
  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(poi => 
      poi.name.toLowerCase().includes(search) ||
      poi.category.toLowerCase().includes(search)
    )
  }

  // Apply sorting
  if (sortField.value) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortField.value!]
      const bVal = b[sortField.value!]
      
      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return filtered
})

// Methods
const startAddingPOI = () => {
  isAddingPOI.value = true
}

const handleAddSave = async (poiData: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>) => {
  try {
    await createPOI(poiData)
    isAddingPOI.value = false
    showSuccess('POI added successfully')
  } catch (error) {
    // Error is already handled by usePOI composable
  }
}

const handleAddCancel = () => {
  isAddingPOI.value = false
}

const handleEdit = (poi: POI) => {
  // Handled by individual table rows
}

const handleDelete = async (poi: POI) => {
  try {
    await deletePOI(poi.id)
    showSuccess('POI deleted successfully')
  } catch (error) {
    // Error is already handled by usePOI composable
  }
}

const handleSave = async (poi: POI) => {
  try {
    await updatePOI(poi)
    showSuccess('POI updated successfully')
  } catch (error) {
    // Error is already handled by usePOI composable
  }
}

const handleCancel = () => {
  // Handled by individual table rows
}

const handleSort = (field: keyof POI) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const togglePOISelection = (poiId: string) => {
  const index = selectedPOIs.value.indexOf(poiId)
  if (index > -1) {
    selectedPOIs.value.splice(index, 1)
  } else {
    selectedPOIs.value.push(poiId)
  }
}

const toggleSelectAll = () => {
  if (selectedPOIs.value.length === filteredPOIs.value.length) {
    selectedPOIs.value = []
  } else {
    selectedPOIs.value = filteredPOIs.value.map(poi => poi.id)
  }
}

const showBulkDeleteConfirmation = () => {
  showBulkDeleteModal.value = true
}

const cancelBulkDelete = () => {
  showBulkDeleteModal.value = false
}

const confirmBulkDelete = async () => {
  try {
    const deletedCount = selectedPOIs.value.length
    for (const poiId of selectedPOIs.value) {
      await deletePOI(poiId)
    }
    selectedPOIs.value = []
    showBulkDeleteModal.value = false
    showSuccess(`${deletedCount} POI(s) deleted successfully`)
  } catch (error) {
    showError('Failed to delete some POIs')
  }
}

const handleCSVImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    await importFromCSV(file)
    // Clear the file input
    if (csvFileInput.value) {
      csvFileInput.value.value = ''
    }
  } catch (error) {
    // Error is already handled by usePOI composable
  }
}

const exportToCSV = async () => {
  isExporting.value = true
  try {
    const response = await fetch('http://localhost:5008/api/pois/export/csv')
    if (!response.ok) {
      throw new Error('Failed to export CSV')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pois_${new Date().toISOString().split('T')[0]}.csv`
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
    const response = await fetch('http://localhost:5008/api/pois/export/geojson')
    if (!response.ok) {
      throw new Error('Failed to export GeoJSON')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pois_${new Date().toISOString().split('T')[0]}.geojson`
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

// Lifecycle
onMounted(() => {
  loadPOIs()
})
</script> 