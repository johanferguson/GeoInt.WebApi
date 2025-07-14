import { ref, computed, type Ref } from 'vue'
import type { POI } from '../entities/POI'

/**
 * Composable for POI table sorting functionality
 * Handles sort field, direction, and sorting logic
 */
export function usePOITableSort(filteredPOIs: Ref<POI[]>) {
  const sortField = ref<keyof POI | null>(null)
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const sortedPOIs = computed(() => {
    let sorted = [...filteredPOIs.value]

    // Apply sorting
    if (sortField.value) {
      sorted = sorted.sort((a, b) => {
        const aVal = a[sortField.value!]
        const bVal = b[sortField.value!]
        
        if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
        return 0
      })
    }

    return sorted
  })

  const handleSort = (field: keyof POI) => {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  return {
    sortField,
    sortDirection,
    sortedPOIs,
    handleSort
  }
} 