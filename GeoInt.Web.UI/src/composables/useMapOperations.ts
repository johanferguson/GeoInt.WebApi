import { ref, computed, readonly, type Ref } from 'vue'
import maplibregl from 'maplibre-gl'
import { POI, CreatePOIRequest } from '@/types/poi'

export interface MapBounds {
  southwest: [number, number]
  northeast: [number, number]
}

export interface MapConfig {
  center: [number, number]
  zoom: number
  maxBounds?: MapBounds
  style?: any
}

export interface MapPopupData {
  poi: POI
  coordinates: [number, number]
  isVisible: boolean
}

/**
 * Default map configuration for South Africa
 */
const DEFAULT_MAP_CONFIG: MapConfig = {
  center: [24.7461, -28.8166], // Center of South Africa
  zoom: 5,
  maxBounds: {
    southwest: [16.3449, -34.8191],
    northeast: [32.8950, -22.1265]
  },
  style: {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }
}

/**
 * Composable for map operations and POI management
 */
export function useMapOperations(mapContainer: Ref<HTMLDivElement | undefined>) {
  // Map state
  const map = ref<maplibregl.Map | null>(null)
  const mapLoaded = ref(false)
  const selectedCategory = ref<string>('')
  const currentPopup = ref<maplibregl.Popup | null>(null)
  const allPOIs = ref<POI[]>([])
  const filteredPOIs = ref<POI[]>([])

  // Add POI mode
  const isAddMode = ref(false)
  const showToast = ref(false)
  const showAddForm = ref(false)
  const newPOI = ref<CreatePOIRequest>({
    name: '',
    category: '',
    lat: 0,
    long: 0
  })

  // Computed properties
  const uniqueCategories = computed(() => {
    const categories = allPOIs.value.map(poi => poi.category)
    return [...new Set(categories)].sort()
  })

  const mapInitialized = computed(() => map.value !== null && mapLoaded.value)

  /**
   * Initialize the map
   */
  const initializeMap = (config: Partial<MapConfig> = {}) => {
    if (!mapContainer.value) {
      throw new Error('Map container element is not available')
    }

    const mapConfig = { ...DEFAULT_MAP_CONFIG, ...config }
    
    map.value = new maplibregl.Map({
      container: mapContainer.value,
      style: mapConfig.style,
      center: mapConfig.center,
      zoom: mapConfig.zoom,
      maxBounds: mapConfig.maxBounds ? [
        mapConfig.maxBounds.southwest,
        mapConfig.maxBounds.northeast
      ] : undefined
    })

    map.value.on('load', () => {
      mapLoaded.value = true
    })

    return map.value
  }

  /**
   * Add POIs to the map
   */
  const addPOIsToMap = (pois: POI[]) => {
    if (!map.value || !mapLoaded.value) return

    // Remove existing layer and source
    if (map.value.getLayer('pois')) {
      map.value.removeLayer('pois')
    }
    if (map.value.getSource('pois')) {
      map.value.removeSource('pois')
    }

    // Create GeoJSON from POIs
    const geojson = {
      type: 'FeatureCollection' as const,
      features: pois.map(poi => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [poi.long, poi.lat]
        },
        properties: {
          id: poi.id,
          name: poi.name,
          category: poi.category,
          created_at: poi.created_at
        }
      }))
    }

    // Add source and layer
    map.value.addSource('pois', {
      type: 'geojson',
      data: geojson
    })

    map.value.addLayer({
      id: 'pois',
      type: 'circle',
      source: 'pois',
      paint: {
        'circle-radius': 8,
        'circle-color': '#2c3e50',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    })

    // Add click event for POIs
    map.value.on('click', 'pois', handlePOIClick)
    map.value.on('mouseenter', 'pois', () => {
      if (map.value) {
        map.value.getCanvas().style.cursor = 'pointer'
      }
    })
    map.value.on('mouseleave', 'pois', () => {
      if (map.value) {
        map.value.getCanvas().style.cursor = ''
      }
    })

    // Fit map to POIs if any exist
    if (pois.length > 0) {
      fitMapToPOIs(pois)
    }
  }

  /**
   * Handle POI click event
   */
  const handlePOIClick = (e: maplibregl.MapMouseEvent) => {
    const features = map.value?.queryRenderedFeatures(e.point, {
      layers: ['pois']
    })

    if (!features || features.length === 0) return

    const feature = features[0]
    const poi = allPOIs.value.find(p => p.id === feature.properties?.id)

    if (poi) {
      showPOIPopup(poi, [feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
    }
  }

  /**
   * Show popup for a POI
   */
  const showPOIPopup = (poi: POI, coordinates: [number, number]) => {
    if (!map.value) return

    // Close existing popup
    if (currentPopup.value) {
      currentPopup.value.remove()
    }

    const popupHTML = `
      <div class="poi-popup">
        <div class="poi-popup-header">
          <h3>${poi.name}</h3>
          <span class="poi-category">${poi.category}</span>
        </div>
        <div class="poi-popup-content">
          <p><strong>Coordinates:</strong> ${poi.lat.toFixed(6)}, ${poi.long.toFixed(6)}</p>
          <p><strong>Created:</strong> ${new Date(poi.created_at).toLocaleDateString()}</p>
        </div>
        <div class="poi-popup-actions">
          <button class="delete-btn" data-poi-id="${poi.id}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `

    currentPopup.value = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false
    })
      .setLngLat(coordinates)
      .setHTML(popupHTML)
      .addTo(map.value)
  }

  /**
   * Close current popup
   */
  const closePopup = () => {
    if (currentPopup.value) {
      currentPopup.value.remove()
      currentPopup.value = null
    }
  }

  /**
   * Filter POIs by category
   */
  const filterPOIsByCategory = (category: string = '') => {
    selectedCategory.value = category
    
    if (category === '') {
      filteredPOIs.value = allPOIs.value
    } else {
      filteredPOIs.value = allPOIs.value.filter(poi => poi.category === category)
    }
    
    addPOIsToMap(filteredPOIs.value)
  }

  /**
   * Update POIs data
   */
  const updatePOIs = (pois: POI[]) => {
    allPOIs.value = pois
    
    // Apply current filter
    if (selectedCategory.value === '') {
      filteredPOIs.value = pois
    } else {
      filteredPOIs.value = pois.filter(poi => poi.category === selectedCategory.value)
    }
    
    addPOIsToMap(filteredPOIs.value)
  }

  /**
   * Fit map to show all POIs
   */
  const fitMapToPOIs = (pois: POI[]) => {
    if (!map.value || pois.length === 0) return

    const bounds = new maplibregl.LngLatBounds()
    pois.forEach(poi => {
      bounds.extend([poi.long, poi.lat])
    })

    map.value.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    })
  }

  /**
   * Toggle add POI mode
   */
  const toggleAddMode = () => {
    isAddMode.value = !isAddMode.value
    showToast.value = isAddMode.value
    
    if (isAddMode.value) {
      // Show instruction toast
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }
  }

  /**
   * Handle map click for adding POIs
   */
  const handleMapClick = (e: maplibregl.MapMouseEvent) => {
    if (isAddMode.value) {
      newPOI.value.lat = e.lngLat.lat
      newPOI.value.long = e.lngLat.lng
      showAddForm.value = true
      isAddMode.value = false
      showToast.value = false
    }
  }

  /**
   * Add click event listener to map
   */
  const addMapClickListener = () => {
    if (map.value) {
      map.value.on('click', handleMapClick)
    }
  }

  /**
   * Remove click event listener from map
   */
  const removeMapClickListener = () => {
    if (map.value) {
      map.value.off('click', handleMapClick)
    }
  }

  /**
   * Get map center
   */
  const getMapCenter = (): [number, number] | null => {
    if (!map.value) return null
    const center = map.value.getCenter()
    return [center.lng, center.lat]
  }

  /**
   * Get map zoom level
   */
  const getMapZoom = (): number | null => {
    return map.value ? map.value.getZoom() : null
  }

  /**
   * Set map center and zoom
   */
  const setMapView = (center: [number, number], zoom: number) => {
    if (map.value) {
      map.value.setCenter(center)
      map.value.setZoom(zoom)
    }
  }

  /**
   * Cleanup map instance
   */
  const destroyMap = () => {
    if (map.value) {
      map.value.remove()
      map.value = null
      mapLoaded.value = false
    }
  }

  return {
    // State
    map: readonly(map),
    mapLoaded: readonly(mapLoaded),
    selectedCategory: readonly(selectedCategory),
    allPOIs: readonly(allPOIs),
    filteredPOIs: readonly(filteredPOIs),
    isAddMode: readonly(isAddMode),
    showToast: readonly(showToast),
    showAddForm: readonly(showAddForm),
    newPOI: readonly(newPOI),
    
    // Computed
    uniqueCategories,
    mapInitialized,
    
    // Methods
    initializeMap,
    addPOIsToMap,
    showPOIPopup,
    closePopup,
    filterPOIsByCategory,
    updatePOIs,
    fitMapToPOIs,
    toggleAddMode,
    handleMapClick,
    addMapClickListener,
    removeMapClickListener,
    getMapCenter,
    getMapZoom,
    setMapView,
    destroyMap
  }
} 