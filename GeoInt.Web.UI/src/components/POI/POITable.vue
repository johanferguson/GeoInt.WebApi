<template>
  <div class="poi-table-container">
    <div class="table-header">
      <div class="header-content">
        <svg class="header-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <h2>Point of Interest Management</h2>
        <span class="poi-count">{{ poisCount }} POIs</span>
      </div>
      <div class="actions">
        <button @click="handleAddPOI" class="btn btn-primary">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add New POI
        </button>
        <CSVImport @imported="handleImportSuccess" />
      </div>
    </div>

    <div class="table-filters">
      <div class="search-box">
        <input 
          v-model="searchTerm"
          type="text"
          placeholder="Search POIs..."
          class="search-input"
        />
      </div>
      <div class="category-filter">
        <select v-model="selectedCategory" class="category-select">
          <option value="">All Categories</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading POIs...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="loadPOIs" class="btn btn-primary">Retry</button>
    </div>

    <div v-else class="table-wrapper">
      <table class="poi-table">
        <thead>
          <tr>
            <th 
              @click="sortBy('name')"
              :class="getHeaderClass('name')"
              class="sortable-header"
            >
              Name
              <span class="sort-indicator" :class="getSortIndicatorClass('name')"></span>
            </th>
            <th 
              @click="sortBy('category')"
              :class="getHeaderClass('category')"
              class="sortable-header"
            >
              Category
              <span class="sort-indicator" :class="getSortIndicatorClass('category')"></span>
            </th>
            <th>Coordinates</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="poi in displayedPOIs" :key="poi.id" class="poi-row">
            <td class="poi-name">{{ poi.name }}</td>
            <td class="poi-category">
              <span class="category-badge">{{ poi.category }}</span>
            </td>
            <td class="poi-coordinates">
              {{ poi.lat.toFixed(6) }}, {{ poi.long.toFixed(6) }}
            </td>
            <td class="poi-created">{{ formatDate(poi.created_at) }}</td>
            <td class="poi-actions">
              <button @click="handleEditPOI(poi)" class="btn btn-sm btn-secondary">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit
              </button>
              <button @click="handleDeletePOI(poi)" class="btn btn-sm btn-danger">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="displayedPOIs.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <h3>No POIs found</h3>
        <p>{{ searchTerm || selectedCategory ? 'No POIs match your current filters' : 'Get started by adding your first POI' }}</p>
      </div>
    </div>

    <!-- POI Form Modal -->
    <POIForm 
      v-if="showAddForm || editingPOI"
      :poi="editingPOI"
      @save="handleSaveComplete"
      @cancel="handleFormCancel"
    />
    
    <!-- Custom Message Box -->
    <MessageBox 
      ref="messageBox"
      :type="messageBoxType"
      :title="messageBoxTitle"
      :message="messageBoxMessage"
      :show-cancel="messageBoxShowCancel"
      :confirm-text="messageBoxConfirmText"
      :cancel-text="messageBoxCancelText"
      :confirm-button-type="messageBoxConfirmButtonType"
      @confirm="handleMessageBoxConfirm"
      @cancel="handleMessageBoxCancel"
      @close="handleMessageBoxClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { POI } from '@/types/poi'
import { usePOIManagement } from '@/composables/usePOIManagement'
import { useSorting } from '@/composables/useSorting'
import { useMessageBox } from '@/utils/ui'
import { formatDate } from '@/utils/ui'
import { debounce } from '@/utils/ui'
import POIForm from './POIForm.vue'
import CSVImport from './CSVImport.vue'
import MessageBox from '@/components/Common/MessageBox.vue'

// Composables
const poiManagement = usePOIManagement()
const messageBox = useMessageBox()

// Local state
const showAddForm = ref(false)
const editingPOI = ref<POI | null>(null)
const searchTerm = ref('')
const selectedCategory = ref('')

// Destructure POI management
const {
  pois,
  loading,
  error,
  poisCount,
  uniqueCategories,
  loadPOIs,
  createPOI,
  updatePOI,
  deletePOI,
  clearError
} = poiManagement

// Destructure message box
const {
  type: messageBoxType,
  title: messageBoxTitle,
  message: messageBoxMessage,
  showCancel: messageBoxShowCancel,
  confirmText: messageBoxConfirmText,
  cancelText: messageBoxCancelText,
  confirmButtonType: messageBoxConfirmButtonType,
  showConfirmation,
  showError,
  showSuccess,
  handleConfirm: handleMessageBoxConfirm,
  handleCancel: handleMessageBoxCancel,
  handleClose: handleMessageBoxClose
} = messageBox

// Filtered POIs based on search and category
const filteredPOIs = computed(() => {
  let filtered = pois.value

  // Apply search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(poi => 
      poi.name.toLowerCase().includes(search) ||
      poi.category.toLowerCase().includes(search)
    )
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(poi => poi.category === selectedCategory.value)
  }

  return filtered
})

// Sorting
const sorting = useSorting(filteredPOIs, 'name')
const { sortedData: displayedPOIs, sortBy, getSortIndicatorClass } = sorting

// Table header classes
const getHeaderClass = (column: string) => {
  return `table-header sortable ${getSortIndicatorClass(column)}`
}

// Event handlers
const handleAddPOI = () => {
  editingPOI.value = null
  showAddForm.value = true
}

const handleEditPOI = (poi: POI) => {
  editingPOI.value = poi
  showAddForm.value = true
}

const handleDeletePOI = async (poi: POI) => {
  const confirmed = await showConfirmation(
    `Are you sure you want to delete "${poi.name}"?`,
    'Delete POI',
    {
      confirmText: 'Delete',
      confirmButtonType: 'danger'
    }
  )

  if (confirmed) {
    const result = await deletePOI(poi.id)
    
    if (result.success) {
      await showSuccess('POI deleted successfully')
    } else {
      await showError(result.error || 'Failed to delete POI')
    }
  }
}

const handleSaveComplete = async () => {
  showAddForm.value = false
  editingPOI.value = null
  
  // Refresh the data
  await loadPOIs()
  
  const action = editingPOI.value ? 'updated' : 'created'
  await showSuccess(`POI ${action} successfully`)
}

const handleFormCancel = () => {
  showAddForm.value = false
  editingPOI.value = null
}

const handleImportSuccess = async () => {
  await loadPOIs()
  await showSuccess('POIs imported successfully')
}

// Debounced search to avoid excessive filtering
const debouncedSearch = debounce(() => {
  // Search is automatically applied through computed property
}, 300)

// Watch for search term changes
watch(searchTerm, debouncedSearch)

// Load POIs on component mount
onMounted(async () => {
  await loadPOIs()
})
</script>

<style scoped>
.poi-table-container {
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #2c3e50;
}

.header-content h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.poi-count {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.table-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.category-filter {
  min-width: 180px;
}

.category-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2c3e50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc3545;
  margin-bottom: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.poi-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.poi-table th,
.poi-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.poi-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  position: relative;
}

.sortable-header:hover {
  background: #e9ecef;
}

.sort-indicator {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.sort-indicator.sort-asc {
  border-bottom: 6px solid #495057;
  opacity: 1;
}

.sort-indicator.sort-desc {
  border-top: 6px solid #495057;
  opacity: 1;
}

.poi-row:hover {
  background: #f8f9fa;
}

.poi-name {
  font-weight: 600;
  color: #2c3e50;
}

.category-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.poi-coordinates {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6c757d;
}

.poi-created {
  color: #6c757d;
  font-size: 0.875rem;
}

.poi-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .poi-table-container {
    margin: 0.5rem;
    padding: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-content {
    justify-content: center;
  }
  
  .table-filters {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-box,
  .category-filter {
    max-width: none;
  }
  
  .poi-table {
    font-size: 0.875rem;
  }
  
  .poi-table th,
  .poi-table td {
    padding: 0.5rem;
  }
  
  .poi-coordinates {
    font-size: 0.75rem;
  }
}
</style> 