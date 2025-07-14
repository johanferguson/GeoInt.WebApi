import { ref, computed, type Ref } from 'vue'
import type { POI } from '../entities/POI'

/**
 * Composable for POI table search and filtering functionality
 * Handles search term and filtering of POI data
 */
export function usePOITableSearch(pois: Ref<POI[]>) {
  const searchTerm = ref('')

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

    return filtered
  })

  return {
    searchTerm,
    filteredPOIs
  }
} 