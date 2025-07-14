import { ref } from 'vue'
import { POI } from '../entities/POI'
import { POIService } from '../services/POIService'
import { POIRepository } from '../repositories/POIRepository'
import { useNotifications } from './useNotifications'

const poiService = new POIService(new POIRepository())

// Singleton reactive state - shared across all usePOI() instances
const pois = ref<POI[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const isImporting = ref(false)
const isLoadingGeoJson = ref(false)

export function usePOI() {
  const { showError, showSuccess } = useNotifications()

  const loadPOIs = async () => {
    isLoading.value = true
    try {
      pois.value = await poiService.getAllPOIs()
    } catch (error) {
      showError('Failed to load POIs')
    } finally {
      isLoading.value = false
    }
  }

  const createPOI = async (poi: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>) => {
    isCreating.value = true
    try {
      const apiResponse = await poiService.createPOI(poi)
      
      // Handle case where API returns only ID (string) instead of full POI object
      let newPOI: POI
      if (typeof apiResponse === 'string') {
        // API returned only ID, create the full POI object locally
        newPOI = {
          id: apiResponse,
          name: poi.name,
          category: poi.category,
          lat: poi.lat,
          long: poi.long,
          created_at: new Date().toISOString(),
          modified_at: undefined,
          deleted_at: undefined
        }
      } else {
        // API returned full POI object
        newPOI = apiResponse
      }
      
      pois.value.push(newPOI)
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

  // Convert reactive POI array to GeoJSON format for immediate use
  const getPOIsAsGeoJsonFromArray = () => {
    return {
      type: 'FeatureCollection',
      features: pois.value.map(poi => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [poi.long, poi.lat]
        },
        properties: {
          id: poi.id,
          name: poi.name,
          category: poi.category,
          created_at: poi.created_at,
          modified_at: poi.modified_at
        }
      }))
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
    getPOIsAsGeoJson,
    getPOIsAsGeoJsonFromArray
  }
} 