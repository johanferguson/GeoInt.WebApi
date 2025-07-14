<template>
  <div class="flex flex-col h-full">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <LoadingSpinner size="large" text="Loading POIs..." />
    </div>

    <!-- Empty State -->
    <div v-else-if="pois.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No POIs found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by adding your first Point of Interest.</p>
      </div>
    </div>

    <!-- Table Content -->
    <div v-else class="flex flex-col h-full">
      <!-- Table -->
      <div class="flex-1 overflow-x-auto overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <!-- Table Header -->
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <!-- Select All Checkbox -->
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="handleSelectAll"
                  class="h-4 w-4 text-geoint-600 focus:ring-geoint-500 border-gray-300 rounded"
                />
              </th>

              <!-- Name Column -->
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  @click="handleSort('name')"
                  class="group inline-flex items-center hover:text-gray-700"
                >
                  Name
                  <span class="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-500">
                    <svg v-if="sortField === 'name'" class="w-4 h-4" :class="{'rotate-180': sortDirection === 'desc'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                    </svg>
                  </span>
                </button>
              </th>

              <!-- Category Column -->
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  @click="handleSort('category')"
                  class="group inline-flex items-center hover:text-gray-700"
                >
                  Category
                  <span class="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-500">
                    <svg v-if="sortField === 'category'" class="w-4 h-4" :class="{'rotate-180': sortDirection === 'desc'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                    </svg>
                  </span>
                </button>
              </th>

              <!-- Latitude Column -->
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latitude
              </th>

              <!-- Longitude Column -->
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Longitude
              </th>

              <!-- Created Date Column -->
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>

              <!-- Actions Column -->
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Add New POI Row -->
            <POITableRow
              v-if="isAdding"
              :is-adding="true"
              @add-save="handleAddSave"
              @add-cancel="handleAddCancel"
            />

            <!-- Existing POI Rows -->
            <POITableRow
              v-for="poi in paginatedPOIs"
              :key="poi.id"
              :poi="poi"
              :is-selected="selectedPois.includes(poi.id)"
              @select="handleSelectPOI"
              @edit="handleEdit"
              @delete="handleDelete"
              @save="handleSave"
              @cancel="handleCancel"
            />
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-700">Show</span>
            <select
              v-model="pageSize"
              class="form-select block w-20 px-3 py-1 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-geoint-500 focus:border-geoint-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span class="text-sm text-gray-700">entries</span>
          </div>
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ startIndex + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(startIndex + pageSize, pois.length) }}</span>
              of
              <span class="font-medium">{{ pois.length }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              </template>
              
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { POI } from '../../entities/POI'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import POITableRow from './POITableRow.vue'

interface Props {
  pois: POI[]
  isLoading: boolean
  selectedPois: string[]
  isAdding: boolean
}

interface Emits {
  (e: 'select-poi', poiId: string): void
  (e: 'select-all'): void
  (e: 'sort', field: keyof POI): void
  (e: 'edit', poi: POI): void
  (e: 'delete', poi: POI): void
  (e: 'save', poi: POI): void
  (e: 'cancel'): void
  (e: 'add-save', poiData: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>): void
  (e: 'add-cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state
const currentPage = ref(1)
const pageSize = ref(20)
const sortField = ref<keyof POI | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

// Computed properties
const totalPages = computed(() => Math.ceil(props.pois.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, props.pois.length))

const paginatedPOIs = computed(() => {
  return props.pois.slice(startIndex.value, endIndex.value)
})

const isAllSelected = computed(() => {
  return props.pois.length > 0 && props.selectedPois.length === props.pois.length
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
const handleSort = (field: keyof POI) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  emit('sort', field)
}

const handleSelectAll = () => {
  emit('select-all')
}

const handleSelectPOI = (poiId: string) => {
  emit('select-poi', poiId)
}

const handleEdit = (poi: POI) => {
  emit('edit', poi)
}

const handleDelete = (poi: POI) => {
  emit('delete', poi)
}

const handleSave = (poi: POI) => {
  emit('save', poi)
}

const handleCancel = () => {
  emit('cancel')
}

const handleAddSave = (poiData: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>) => {
  emit('add-save', poiData)
}

const handleAddCancel = () => {
  emit('add-cancel')
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

const goToPage = (page: number) => {
  currentPage.value = page
}

// Watch for page size changes and reset to page 1
watch(pageSize, () => {
  currentPage.value = 1
})

// Watch for POI changes and adjust current page if needed
watch(() => props.pois.length, (newLength) => {
  const maxPage = Math.ceil(newLength / pageSize.value)
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage
  }
})
</script> 