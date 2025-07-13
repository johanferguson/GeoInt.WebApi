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
      console.log('usePOI: Loading POIs from API...')
      const loadedPOIs = await poiService.getAllPOIs()
      console.log('usePOI: Loaded POIs:', loadedPOIs.length)
      pois.value = loadedPOIs
      console.log('usePOI: Reactive POI array updated with:', pois.value.length, 'POIs')
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
      console.log('usePOI: Creating POI with data:', poi)
      const apiResponse = await poiService.createPOI(poi)
      console.log('usePOI: API returned:', apiResponse)
      
      // Handle case where API returns only ID (string) instead of full POI object
      let newPOI: POI
      if (typeof apiResponse === 'string') {
        // API returned only ID, create the full POI object locally
        console.log('usePOI: API returned only ID, creating full POI object locally')
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
      
      console.log('usePOI: Final POI object:', newPOI)
      console.log('usePOI: POI count before:', pois.value.length)
      pois.value.push(newPOI)
      console.log('usePOI: POI count after:', pois.value.length)
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
    console.log('getPOIsAsGeoJsonFromArray: Converting', pois.value.length, 'POIs to GeoJSON')
    const lastPOI = pois.value[pois.value.length - 1]
    console.log('getPOIsAsGeoJsonFromArray: Last POI:', lastPOI)
    console.log('getPOIsAsGeoJsonFromArray: Last POI coordinates:', { lat: lastPOI?.lat, long: lastPOI?.long })
    const geoJson = {
      type: 'FeatureCollection',
      features: pois.value.map(poi => {
        const feature = {
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
        }
        return feature
      })
    }
    console.log('getPOIsAsGeoJsonFromArray: Generated GeoJSON with', geoJson.features.length, 'features')
    const lastFeature = geoJson.features[geoJson.features.length - 1]
    console.log('getPOIsAsGeoJsonFromArray: Last feature coordinates:', lastFeature.geometry.coordinates)
    console.log('getPOIsAsGeoJsonFromArray: Last feature properties:', lastFeature.properties)
    return geoJson
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