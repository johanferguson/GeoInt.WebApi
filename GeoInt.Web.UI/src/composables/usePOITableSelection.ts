import { ref, computed, type Ref } from 'vue'
import type { POI } from '../entities/POI'

/**
 * Composable for POI table selection and bulk operations functionality
 * Handles multi-select, select all, and bulk actions
 */
export function usePOITableSelection(filteredPOIs: Ref<POI[]>) {
  const selectedPOIs = ref<string[]>([])
  const showBulkDeleteModal = ref(false)

  const isAllSelected = computed(() => {
    return filteredPOIs.value.length > 0 && selectedPOIs.value.length === filteredPOIs.value.length
  })

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

  const clearSelection = () => {
    selectedPOIs.value = []
  }

  return {
    selectedPOIs,
    showBulkDeleteModal,
    isAllSelected,
    toggleSelectAll,
    togglePOISelection,
    showBulkDeleteConfirmation,
    cancelBulkDelete,
    clearSelection
  }
} 