import { ref, computed, readonly, type Ref } from 'vue'
import { poiApi } from '@/services/api'
import { POI, CreatePOIRequest, UpdatePOIRequest } from '@/types/poi'

export interface POIOperationResult {
  success: boolean
  error?: string
  data?: any
}

export interface POIState {
  pois: Ref<POI[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  selectedPOI: Ref<POI | null>
}

export function usePOIManagement() {
  // Reactive state
  const pois = ref<POI[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedPOI = ref<POI | null>(null)

  // Computed properties
  const poisCount = computed(() => pois.value.length)
  const uniqueCategories = computed(() => {
    const categories = pois.value.map(poi => poi.category)
    return [...new Set(categories)].sort()
  })

  // Internal helper functions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // API operations
  const loadPOIs = async (): Promise<POIOperationResult> => {
    setLoading(true)
    clearError()
    
    try {
      const data = await poiApi.getAllPOIs()
      pois.value = data
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load POIs'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const createPOI = async (poiData: CreatePOIRequest): Promise<POIOperationResult> => {
    setLoading(true)
    clearError()
    
    try {
      const id = await poiApi.createPOI(poiData)
      // Refresh the POI list to get the newly created POI
      await loadPOIs()
      return { success: true, data: { id } }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create POI'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updatePOI = async (poiData: UpdatePOIRequest): Promise<POIOperationResult> => {
    setLoading(true)
    clearError()
    
    try {
      await poiApi.updatePOI(poiData)
      // Update the local state
      const index = pois.value.findIndex(poi => poi.id === poiData.id)
      if (index !== -1) {
        pois.value[index] = { ...pois.value[index], ...poiData }
      }
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update POI'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deletePOI = async (id: string): Promise<POIOperationResult> => {
    setLoading(true)
    clearError()
    
    try {
      await poiApi.deletePOI(id)
      // Remove from local state
      pois.value = pois.value.filter(poi => poi.id !== id)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete POI'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getPOIById = (id: string): POI | undefined => {
    return pois.value.find(poi => poi.id === id)
  }

  const selectPOI = (poi: POI | null) => {
    selectedPOI.value = poi
  }

  const bulkImportFromCSV = async (file: File): Promise<POIOperationResult> => {
    setLoading(true)
    clearError()
    
    try {
      await poiApi.bulkCreateFromCSV(file)
      // Refresh the POI list
      await loadPOIs()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import POIs from CSV'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async (): Promise<POIOperationResult> => {
    setLoading(true)
    clearError()
    
    try {
      const blob = await poiApi.exportToCSV()
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pois-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export POIs to CSV'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const exportToGeoJSON = async (): Promise<POIOperationResult> => {
    setLoading(true)
    clearError()
    
    try {
      const blob = await poiApi.exportToGeoJSON()
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pois-export-${new Date().toISOString().split('T')[0]}.geojson`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export POIs to GeoJSON'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Return the composable interface
  return {
    // State
    pois: readonly(pois),
    loading: readonly(loading),
    error: readonly(error),
    selectedPOI: readonly(selectedPOI),
    
    // Computed
    poisCount,
    uniqueCategories,
    
    // Methods
    loadPOIs,
    createPOI,
    updatePOI,
    deletePOI,
    getPOIById,
    selectPOI,
    bulkImportFromCSV,
    exportToCSV,
    exportToGeoJSON,
    clearError
  }
} 