import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { Map, NavigationControl, type MapOptions } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapState {
  map: Ref<any>
  isLoaded: Ref<boolean>
  error: Ref<string | null>
}

export function useMap(container: Ref<HTMLElement | null>, options?: Partial<MapOptions>): MapState {
  const map = ref<any>(null)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // OpenStreetMap style with actual street data
  const osmStyle = {
    version: 8 as const,
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    sources: {
      'osm-tiles': {
        type: 'raster' as const,
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster' as const,
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }

  const defaultOptions: MapOptions = {
    container: container.value!,
    style: osmStyle,
    center: [0, 0],
    zoom: 2,
    attributionControl: true
  }

  onMounted(() => {
    if (!container.value) {
      error.value = 'Map container is required'
      return
    }

    try {
      const mapInstance = new Map({
        ...defaultOptions,
        ...options,
        container: container.value
      })

      // Navigation controls removed per user request

      // Handle map load
      mapInstance.on('load', () => {
        isLoaded.value = true
        error.value = null
      })

      // Handle map errors
      mapInstance.on('error', (e) => {
        error.value = e.error?.message || 'Map error occurred'
        console.error('Map error:', e)
      })

      map.value = mapInstance
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize map'
      console.error('Map initialization error:', err)
    }
  })

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  })

  return {
    map,
    isLoaded,
    error
  }
} 