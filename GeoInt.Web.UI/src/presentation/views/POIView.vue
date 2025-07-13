<template>
  <div class="h-full flex flex-col">
    <!-- Table Controls -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-lg font-semibold text-gray-900">POI Management</h2>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">{{ filteredPOICount }} of {{ totalPOIs }} POIs</span>
            <div v-if="isLoading" class="spinner"></div>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search POIs..."
              class="form-input pl-10 w-64"
            />
            <MagnifyingGlassIcon class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          <!-- Category Filter -->
          <select v-model="categoryFilter" class="form-input w-48">
            <option value="">All Categories</option>
            <option 
              v-for="category in availableCategories" 
              :key="category" 
              :value="category"
            >
              {{ category }}
            </option>
          </select>
          
          <!-- CSV Import -->
          <button @click="openImportModal" class="btn btn-secondary btn-sm">
            <ArrowUpTrayIcon class="w-4 h-4 mr-1" />
            Import CSV
          </button>
          
          <!-- Add POI -->
          <button @click="openCreateModal" class="btn btn-primary btn-sm">
            <PlusIcon class="w-4 h-4 mr-1" />
            Add POI
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-header-cell">
              <button 
                @click="setSorting('name')"
                class="flex items-center space-x-1 hover:text-gray-700"
              >
                <span>Name</span>
                <ChevronUpIcon 
                  v-if="sorting.field === 'name' && sorting.direction === 'asc'" 
                  class="w-4 h-4"
                />
                <ChevronDownIcon 
                  v-if="sorting.field === 'name' && sorting.direction === 'desc'" 
                  class="w-4 h-4"
                />
              </button>
            </th>
            <th class="table-header-cell">
              <button 
                @click="setSorting('category')"
                class="flex items-center space-x-1 hover:text-gray-700"
              >
                <span>Category</span>
                <ChevronUpIcon 
                  v-if="sorting.field === 'category' && sorting.direction === 'asc'" 
                  class="w-4 h-4"
                />
                <ChevronDownIcon 
                  v-if="sorting.field === 'category' && sorting.direction === 'desc'" 
                  class="w-4 h-4"
                />
              </button>
            </th>
            <th class="table-header-cell">Coordinates</th>
            <th class="table-header-cell">Created</th>
            <th class="table-header-cell">Modified</th>
            <th class="table-header-cell">Actions</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="poi in paginatedPOIs" :key="poi.id" class="table-row">
            <td class="table-cell font-medium">{{ poi.name }}</td>
            <td class="table-cell">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ poi.category }}
              </span>
            </td>
            <td class="table-cell text-xs text-gray-500">
              {{ poi.lat.toFixed(6) }}, {{ poi.long.toFixed(6) }}
            </td>
            <td class="table-cell text-sm text-gray-500">
              {{ formatDate(poi.created_at) }}
            </td>
            <td class="table-cell text-sm text-gray-500">
              {{ poi.modified_at ? formatDate(poi.modified_at) : '-' }}
            </td>
            <td class="table-cell">
              <div class="flex items-center space-x-2">
                <button 
                  @click="openEditModal(poi)"
                  class="text-primary-600 hover:text-primary-900 text-sm"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button 
                  @click="openDeleteConfirmation(poi)"
                  class="text-error-600 hover:text-error-900 text-sm"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty State -->
      <div v-if="filteredPOIs.length === 0 && !isLoading" class="text-center py-12">
        <MapIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No POIs found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ filters.searchTerm || filters.category ? 'Try adjusting your filters' : 'Get started by adding your first POI' }}
        </p>
        <div class="mt-6">
          <button @click="openCreateModal" class="btn btn-primary btn-sm">
            <PlusIcon class="w-4 h-4 mr-1" />
            Add POI
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white border-t border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredPOICount) }} of {{ filteredPOICount }} results
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-secondary btn-sm"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          
          <div class="flex items-center space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'btn btn-sm',
                currentPage === page ? 'btn-primary' : 'btn-secondary'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-secondary btn-sm"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <POIFormModal 
      v-if="showCreateModal"
      :is-editing="false"
      @close="closeModals"
      @submit="handleCreatePOI"
    />
    
    <POIFormModal 
      v-if="showEditModal && selectedPOI"
      :is-editing="true"
      :poi="selectedPOI"
      @close="closeModals"
      @submit="handleUpdatePOI"
    />
    
    <ImportCSVModal 
      v-if="showImportModal"
      @close="closeImportModal"
      @import="handleImportCSV"
    />
    
    <ConfirmationModal
      v-if="showDeleteConfirmation && selectedPOI"
      :title="`Delete ${selectedPOI.name}?`"
      :message="`Are you sure you want to delete this POI? This action cannot be undone.`"
      confirm-text="Delete"
      confirm-class="btn-error"
      @confirm="handleDeletePOI"
      @cancel="closeModals"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon,
  MapIcon
} from '@heroicons/vue/24/outline';
import { usePOI } from '../../composables/usePOI';
import { POIModel, POICreateRequest, POIUpdateRequest } from '@/models/POI';
import POIFormModal from '@/components/POIFormModal.vue';
import ImportCSVModal from '@/components/ImportCSVModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

// Reactive state
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');
const categoryFilter = ref('');
const showImportModal = ref(false);

// Composables
const {
  filteredPOIs,
  totalPOIs,
  filteredPOICount,
  availableCategories,
  isLoading,
  selectedPOI,
  showCreateModal,
  showEditModal,
  showDeleteConfirmation,
  filters,
  sorting,
  loadPOIs,
  createPOI,
  updatePOI,
  deletePOI,
  bulkCreatePOIs,
  openCreateModal,
  openEditModal,
  openDeleteConfirmation,
  closeModals,
  setSearchTerm,
  setCategory,
  setSorting
} = usePOI();

// Computed
const paginatedPOIs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredPOIs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredPOICount.value / pageSize.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages.value, start + maxVisible - 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Methods
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const handleCreatePOI = async (poiData: POICreateRequest) => {
  await createPOI(poiData);
  currentPage.value = 1; // Reset to first page
};

const handleUpdatePOI = async (poiData: POIUpdateRequest) => {
  await updatePOI(poiData);
};

const handleDeletePOI = async () => {
  if (selectedPOI.value) {
    await deletePOI(selectedPOI.value.id);
    // Adjust current page if needed
    if (paginatedPOIs.value.length === 0 && currentPage.value > 1) {
      currentPage.value = currentPage.value - 1;
    }
  }
};

const handleImportCSV = async (csvData: any[]) => {
  const pois = csvData.map(row => ({
    name: row.name,
    category: row.category,
    lat: parseFloat(row.lat),
    long: parseFloat(row.long)
  }));
  
  await bulkCreatePOIs({ pois });
  showImportModal.value = false;
  currentPage.value = 1; // Reset to first page
};

const openImportModal = () => {
  showImportModal.value = true;
};

const closeImportModal = () => {
  showImportModal.value = false;
};

// Watchers
watch(searchTerm, (newValue) => {
  setSearchTerm(newValue);
  currentPage.value = 1; // Reset to first page when searching
});

watch(categoryFilter, (newValue) => {
  setCategory(newValue);
  currentPage.value = 1; // Reset to first page when filtering
});

// Initialize
loadPOIs();
</script>

<style scoped>
/* Table hover effects */
.table-row:hover {
  @apply bg-gray-50;
}

/* Button hover effects */
button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Pagination active state */
.btn-primary {
  @apply bg-primary-600 text-white;
}
</style> 