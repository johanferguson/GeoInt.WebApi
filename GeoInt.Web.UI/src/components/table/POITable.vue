<template>
  <div class="flex flex-col h-full">
    <!-- Table Controls -->
    <div class="bg-white border-b border-gray-200 px-8 py-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-6">
          <!-- Add Button -->
          <button
            @click="startAddingPOI"
            class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-geoint-600 hover:bg-geoint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 transition-all duration-200"
          >
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New POI
          </button>

          <!-- Search -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search POIs..."
              class="block w-96 pl-12 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-geoint-500 focus:border-geoint-500 text-lg transition-all duration-200"
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
              class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50 transition-all duration-200"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              Import CSV
            </button>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="selectedPOIs.length > 0" class="flex items-center space-x-4">
          <span class="text-lg font-semibold text-gray-700">
            {{ selectedPOIs.length }} selected
          </span>
          <button
            @click="showBulkDeleteConfirmation"
            class="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-lg font-semibold text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete Selected
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <LoadingSpinner size="large" text="Loading POIs..." />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPOIs.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
        <h3 class="mt-4 text-2xl font-semibold text-gray-900">No POIs found</h3>
        <p class="mt-2 text-lg text-gray-500">
          {{ searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first Point of Interest.' }}
        </p>
      </div>
    </div>

    <!-- Table Content -->
    <div v-else class="flex flex-col">
      <!-- Table -->
      <div class="flex-1 overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <!-- Table Header -->
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <!-- Select All Checkbox -->
              <th scope="col" class="px-8 py-5 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="h-5 w-5 text-geoint-600 focus:ring-geoint-500 border-gray-300 rounded"
                />
              </th>

              <!-- Name Column -->
              <th scope="col" class="px-8 py-5 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                <button
                  @click="handleSort('name')"
                  class="group inline-flex items-center hover:text-gray-900 transition-colors duration-200"
                >
                  Name
                  <span class="ml-3 flex-none rounded text-gray-400 group-hover:text-gray-500">
                    <svg v-if="sortField === 'name'" class="w-5 h-5" :class="{'rotate-180': sortDirection === 'desc'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                    </svg>
                  </span>
                </button>
              </th>

              <!-- Category Column -->
              <th scope="col" class="px-8 py-5 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                <button
                  @click="handleSort('category')"
                  class="group inline-flex items-center hover:text-gray-900 transition-colors duration-200"
                >
                  Category
                  <span class="ml-3 flex-none rounded text-gray-400 group-hover:text-gray-500">
                    <svg v-if="sortField === 'category'" class="w-5 h-5" :class="{'rotate-180': sortDirection === 'desc'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                    </svg>
                  </span>
                </button>
              </th>

              <!-- Created Date Column -->
              <th scope="col" class="px-8 py-5 text-left text-lg font-bold text-gray-700 uppercase tracking-wider">
                Created Date
              </th>

              <!-- Actions Column -->
              <th scope="col" class="px-8 py-5 text-right text-lg font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Add New POI Row -->
            <POITableRow
              v-if="isAddingPOI"
              :is-adding="true"
              :category-colors="POI_CATEGORY_COLORS"
              @add-save="handleAddSave"
              @add-cancel="handleAddCancel"
            />

            <!-- Existing POI Rows -->
            <POITableRow
              v-for="poi in paginatedPOIs"
              :key="poi.id"
              :poi="poi"
              :is-selected="selectedPOIs.includes(poi.id)"
              :category-colors="POI_CATEGORY_COLORS"
              @select="togglePOISelection"
              @edit="handleEdit"
              @delete="handleDelete"
              @save="handleSave"
              @cancel="handleCancel"
            />
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-8 py-6 flex items-center justify-between border-t border-gray-200">
        <div class="flex-1 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-lg font-semibold text-gray-700">Show</span>
            <select
              v-model="pageSize"
              @change="handlePageSizeChange"
              class="form-select block w-24 px-4 py-2 text-lg border-gray-300 rounded-lg focus:outline-none focus:ring-geoint-500 focus:border-geoint-500 font-semibold"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span class="text-lg font-semibold text-gray-700">entries</span>
          </div>
          <div>
            <p class="text-lg font-semibold text-gray-700">
              Showing
              <span class="font-bold text-geoint-600">{{ startIndex + 1 }}</span>
              to
              <span class="font-bold text-geoint-600">{{ Math.min(startIndex + Number(pageSize), filteredPOIs.length) }}</span>
              of
              <span class="font-bold text-geoint-600">{{ filteredPOIs.length }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-3 py-3 rounded-l-lg border border-gray-300 bg-white text-lg font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <template v-for="page in visiblePages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage
                      ? 'bg-geoint-50 border-geoint-500 text-geoint-600 z-10'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-5 py-3 border text-lg font-semibold transition-all duration-200'
                  ]"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  class="relative inline-flex items-center px-5 py-3 border border-gray-300 bg-white text-lg font-semibold text-gray-700"
                >
                  ...
                </span>
              </template>
              
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-3 py-3 rounded-r-lg border border-gray-300 bg-white text-lg font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
              >
                <span class="sr-only">Next</span>
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div v-if="showBulkDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-6 border w-auto max-w-md shadow-2xl rounded-xl bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mt-6">Delete Selected POIs</h3>
          <div class="mt-4 px-7 py-3">
            <p class="text-lg text-gray-500">
              Are you sure you want to delete {{ selectedPOIs.length }} POI(s)? This action cannot be undone.
            </p>
          </div>
          <div class="flex justify-center space-x-6 mt-6">
            <button
              @click="cancelBulkDelete"
              class="px-6 py-3 bg-gray-300 text-gray-800 text-lg font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              @click="confirmBulkDelete"
              :disabled="isDeleting"
              class="px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
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
import { ref, computed, watch, onMounted } from 'vue'
import { usePOI } from '../../composables/usePOI'
import { useNotifications } from '../../composables/useNotifications'
import { POI } from '../../entities/POI'
import { POI_CATEGORY_COLORS } from '../../constants/poiCategories'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import POITableRow from './POITableRow.vue'

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
const csvFileInput = ref<HTMLInputElement | null>(null)
const sortField = ref<keyof POI | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = ref<number>(10)

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

const totalPages = computed(() => Math.ceil(filteredPOIs.value.length / Number(pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * Number(pageSize.value))
const endIndex = computed(() => Math.min(startIndex.value + Number(pageSize.value), filteredPOIs.value.length))

const paginatedPOIs = computed(() => {
  const size = Number(pageSize.value)
  const start = (currentPage.value - 1) * size
  const end = Math.min(start + size, filteredPOIs.value.length)
  // Create a shallow copy to avoid affecting original data
  return [...filteredPOIs.value].slice(start, end)
})

const isAllSelected = computed(() => {
  return filteredPOIs.value.length > 0 && selectedPOIs.value.length === filteredPOIs.value.length
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    // Show all pages
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Show abbreviated pagination
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    if (total > 1) {
      pages.push(total)
    }
  }
  
  return pages
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
    await updatePOI(poi.id, poi)
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

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedPOIs.value = []
  } else {
    selectedPOIs.value = filteredPOIs.value.map(poi => poi.id)
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

const showBulkDeleteConfirmation = () => {
  showBulkDeleteModal.value = true
}

const cancelBulkDelete = () => {
  showBulkDeleteModal.value = false
}

const confirmBulkDelete = async () => {
  try {
    for (const poiId of selectedPOIs.value) {
      await deletePOI(poiId)
    }
    selectedPOIs.value = []
    showBulkDeleteModal.value = false
    showSuccess('POIs deleted successfully')
  } catch (error) {
    // Error is already handled by usePOI composable
  }
}

const handleCSVImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    await importFromCSV(file)
    showSuccess('POIs imported successfully')
  } catch (error) {
    // Error is already handled by usePOI composable
  }
  
  // Reset file input
  if (csvFileInput.value) {
    csvFileInput.value.value = ''
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    currentPage.value = page
  }
}

const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  pageSize.value = Number(target.value)
  currentPage.value = 1
}

// Page size changes are handled by handlePageSizeChange method

// Watch for search changes and reset to page 1
watch(searchTerm, () => {
  currentPage.value = 1
})

// Watch for filtered POIs changes and adjust current page if needed
watch(filteredPOIs, (newPOIs) => {
  const maxPage = Math.ceil(newPOIs.length / Number(pageSize.value))
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage
  }
}, { immediate: true })

// Initialize
onMounted(() => {
  loadPOIs()
})
</script>

<style scoped>
/* Increase font sizes throughout the table */
.bg-white {
  font-size: 18px; /* Base font size increased even more */
}

/* Search input styling */
input[type="text"] {
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* Button font sizes */
button {
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* Table header font sizes */
th {
  font-size: 18px !important;
  font-weight: 700 !important;
}

/* Pagination text */
.text-sm {
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* Entry count text */
p.text-sm {
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* Form select styling */
select {
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* Loading and empty state text */
h3 {
  font-size: 24px !important;
  font-weight: 700 !important;
}

/* Modal text */
.modal-text {
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* Bulk actions */
.bulk-actions span {
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* Professional button hover effects */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Corporate styling */
.bg-gray-50 {
  background-color: #f8fafc;
}

/* Enhanced table styling */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background-color: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
}

/* Professional typography */
* {
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}

/* Input focus states */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Improved spacing */
.space-x-6 > * + * {
  margin-left: 1.5rem;
}

/* Modal improvements */
.modal-content {
  backdrop-filter: blur(10px);
}
</style> 