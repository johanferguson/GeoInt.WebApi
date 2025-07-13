import { ref } from 'vue'
import { POI } from '../entities/POI'
import { POIService } from '../services/POIService'
import { POIRepository } from '../repositories/POIRepository'
import { useNotifications } from './useNotifications'

const poiService = new POIService(new POIRepository())

export function usePOI() {
  const { showError, showSuccess } = useNotifications()
  
  const pois = ref<POI[]>([])
  const isLoading = ref(false)
  const isCreating = ref(false)
  const isUpdating = ref(false)
  const isDeleting = ref(false)
  const isImporting = ref(false)
  const isLoadingGeoJson = ref(false)

  const loadPOIs = async () => {
    isLoading.value = true
    try {
      pois.value = await poiService.getAllPOIs()
    } catch (error) {
      showError('Failed to load POIs')
      console.error('Error loading POIs:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createPOI = async (poi: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>) => {
    isCreating.value = true
    try {
      const newPOI = await poiService.createPOI(poi)
      pois.value.push(newPOI)
      showSuccess('POI created successfully')
      return newPOI
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create POI'
      showError('Failed to create POI', message)
      throw error
    } finally {
      isCreating.value = false
    }
  }

  const updatePOI = async (poi: POI) => {
    isUpdating.value = true
    try {
      const updatedPOI = await poiService.updatePOI(poi)
      const index = pois.value.findIndex(p => p.id === poi.id)
      if (index !== -1) {
        pois.value[index] = updatedPOI
      }
      showSuccess('POI updated successfully')
      return updatedPOI
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update POI'
      showError('Failed to update POI', message)
      throw error
    } finally {
      isUpdating.value = false
    }
  }

  const deletePOI = async (id: string) => {
    isDeleting.value = true
    try {
      await poiService.deletePOI(id)
      pois.value = pois.value.filter(p => p.id !== id)
      // Success notification now handled by caller
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete POI'
      showError('Failed to delete POI', message)
      throw error
    } finally {
      isDeleting.value = false
    }
  }

  const importFromCSV = async (file: File) => {
    isImporting.value = true
    try {
      const result = await poiService.importFromCSV(file)
      showSuccess(`Successfully imported ${result.count} POIs`)
      await loadPOIs() // Refresh the list
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import CSV'
      showError('Failed to import CSV', message)
      throw error
    } finally {
      isImporting.value = false
    }
  }

  const getPOIsAsGeoJson = async () => {
    isLoadingGeoJson.value = true
    try {
      const geoJson = await poiService.getPOIsAsGeoJson()
      return geoJson
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load POIs as GeoJSON'
      showError('Failed to load POIs as GeoJSON', message)
      throw error
    } finally {
      isLoadingGeoJson.value = false
    }
  }

  return {
    pois,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting,
    isLoadingGeoJson,
    loadPOIs,
    createPOI,
    updatePOI,
    deletePOI,
    importFromCSV,
    getPOIsAsGeoJson
  }
} 