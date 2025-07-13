<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
    
    <!-- Category Filter Dropdown -->
    <div class="category-filter">
      <select v-model="selectedCategory" @change="handleCategoryChange" class="category-select">
        <option value="">All Categories</option>
        <option v-for="category in uniqueCategories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Add Point Button -->
    <button 
      @click="toggleAddMode"
      :class="{ active: isAddMode }"
      class="add-point-btn"
    >
      <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" opacity="0.7"/>
      </svg>
      {{ isAddMode ? 'Cancel Add' : 'Add Point' }}
    </button>

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast-notification">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      Click where you want to add the point
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Loading POIs...</span>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-overlay">
      <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="handleRetry" class="btn btn-primary">Retry</button>
    </div>

    <!-- POI Form Modal -->
    <POIForm 
      v-if="showAddForm"
      :poi="newPOI"
      @save="handlePOISave"
      @cancel="handleFormCancel"
    />
    
    <!-- Message Box -->
    <MessageBox 
      ref="messageBoxRef"
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { usePOIManagement } from '@/composables/usePOIManagement'
import { useMapOperations } from '@/composables/useMapOperations'
import { useMessageBox } from '@/utils/ui'
import { CreatePOIRequest } from '@/types/poi'
import POIForm from '@/components/POI/POIForm.vue'
import MessageBox from '@/components/Common/MessageBox.vue'

// Template refs
const mapContainer = ref<HTMLDivElement>()
const messageBoxRef = ref<InstanceType<typeof MessageBox>>()

// Composables
const poiManagement = usePOIManagement()
const mapOperations = useMapOperations(mapContainer)
const messageBox = useMessageBox()

// Destructure POI management
const {
  pois,
  loading,
  error,
  uniqueCategories,
  loadPOIs,
  createPOI,
  deletePOI,
  clearError
} = poiManagement

// Destructure map operations
const {
  map,
  mapLoaded,
  selectedCategory,
  isAddMode,
  showToast,
  showAddForm,
  newPOI,
  mapInitialized,
  initializeMap,
  updatePOIs,
  filterPOIsByCategory,
  toggleAddMode,
  addMapClickListener,
  removeMapClickListener,
  closePopup,
  destroyMap
} = mapOperations

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

// Event handlers
const handleCategoryChange = () => {
  filterPOIsByCategory(selectedCategory.value)
}

const handleRetry = async () => {
  clearError()
  await loadPOIs()
}

const handlePOISave = async (poiData: CreatePOIRequest) => {
  const result = await createPOI(poiData)
  
  if (result.success) {
    showAddForm.value = false
    // Reset form data
    newPOI.value = {
      name: '',
      category: '',
      lat: 0,
      long: 0
    }
    
    // Refresh POIs and update map
    await loadPOIs()
    updatePOIs(pois.value)
    
    await showSuccess('POI created successfully')
  } else {
    await showError(result.error || 'Failed to create POI')
  }
}

const handleFormCancel = () => {
  showAddForm.value = false
  newPOI.value = {
    name: '',
    category: '',
    lat: 0,
    long: 0
  }
}

const handleDeletePOI = async (poiId: string) => {
  const poi = pois.value.find(p => p.id === poiId)
  if (!poi) return
  
  const confirmed = await showConfirmation(
    `Are you sure you want to delete "${poi.name}"?`,
    'Delete POI',
    {
      confirmText: 'Delete',
      confirmButtonType: 'danger'
    }
  )
  
  if (confirmed) {
    const result = await deletePOI(poiId)
    
    if (result.success) {
      // Close any open popups
      closePopup()
      
      // Update map with new POI list
      updatePOIs(pois.value)
      
      await showSuccess('POI deleted successfully')
    } else {
      await showError(result.error || 'Failed to delete POI')
    }
  }
}

// Initialize map and load POIs
onMounted(async () => {
  await nextTick()
  
  try {
    // Initialize map
    initializeMap()
    
    // Load POIs
    await loadPOIs()
    
    // Update map with POIs
    updatePOIs(pois.value)
    
    // Add map click listener for adding POIs
    addMapClickListener()
    
    // Add delete button event listener to document
    document.addEventListener('click', handleDeleteButtonClick)
    
  } catch (error) {
    console.error('Error initializing map:', error)
    await showError('Failed to initialize map')
  }
})

onUnmounted(() => {
  // Remove event listeners
  removeMapClickListener()
  document.removeEventListener('click', handleDeleteButtonClick)
  
  // Destroy map
  destroyMap()
})

// Handle delete button clicks in popups
const handleDeleteButtonClick = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
    const button = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn')
    const poiId = button?.getAttribute('data-poi-id')
    if (poiId) {
      handleDeletePOI(poiId)
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.category-filter {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
}

.category-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 180px;
}

.category-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.add-point-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-point-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(44, 62, 80, 0.4);
}

.add-point-btn.active {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-notification {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 1000;
  background: #28a745;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  color: #495057;
  text-align: center;
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

.error-overlay {
  background: rgba(248, 249, 250, 0.95);
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-overlay p {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #dc3545;
}

/* Responsive design */
@media (max-width: 768px) {
  .category-filter,
  .add-point-btn {
    top: 10px;
    font-size: 0.75rem;
  }
  
  .category-filter {
    left: 10px;
  }
  
  .add-point-btn {
    right: 10px;
    padding: 0.5rem 1rem;
  }
  
  .toast-notification {
    top: 60px;
    right: 10px;
    font-size: 0.75rem;
    padding: 0.75rem 1rem;
  }
  
  .category-select {
    min-width: 150px;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .category-filter,
  .add-point-btn {
    position: static;
    margin: 0.5rem;
  }
  
  .map-container {
    flex-direction: column;
  }
  
  .map {
    height: calc(100vh - 120px);
  }
  
  .toast-notification {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    right: auto;
    max-width: 80%;
  }
}
</style>

<style>
/* Global styles for map popups */
.poi-popup {
  min-width: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.poi-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.poi-popup-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.poi-category {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.poi-popup-content {
  margin-bottom: 0.75rem;
  color: #495057;
  font-size: 0.875rem;
}

.poi-popup-content p {
  margin: 0.25rem 0;
}

.poi-popup-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}
</style> 