import { ref, computed, watch, onMounted, onUnmounted, Ref } from 'vue';
import { Map, Marker, Popup, LngLatBounds } from 'maplibre-gl';
import { POIModel } from '@/models/POI';
import { MapBounds, GeoJSONFeatureCollection } from '@/types/common';
import { usePOIStore } from '@/stores/poiStore';
import { useMessageStore } from '@/stores/messageStore';

export function useMap(containerRef: Ref<HTMLElement | null>) {
  const poiStore = usePOIStore();
  const messageStore = useMessageStore();
  
  // Reactive state
  const map = ref<Map | null>(null);
  const isMapLoaded = ref(false);
  const markers = ref<Marker[]>([]);
  const popup = ref<Popup | null>(null);
  const selectedCategory = ref<string | undefined>(undefined);
  
  // Computed properties
  const filteredPOIs = computed(() => {
    if (!selectedCategory.value) return poiStore.pois;
    return poiStore.pois.filter(poi => poi.category === selectedCategory.value);
  });
  
  const availableCategories = computed(() => {
    const categories = new Set(poiStore.pois.map(poi => poi.category));
    return Array.from(categories).sort();
  });
  
  const mapBounds = computed(() => {
    if (filteredPOIs.value.length === 0) return null;
    
    const lats = filteredPOIs.value.map(poi => poi.lat);
    const longs = filteredPOIs.value.map(poi => poi.long);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...longs),
      west: Math.min(...longs)
    };
  });
  
  // Initialize map
  const initializeMap = async () => {
    if (!containerRef.value) return;
    
    try {
      map.value = new Map({
        container: containerRef.value,
        style: 'https://tiles.openstreetmap.org/{z}/{x}/{y}.png',
        center: [0, 0],
        zoom: 2
      });
      
      map.value.on('load', () => {
        isMapLoaded.value = true;
        loadPOIsOnMap();
      });
      
      // Create popup instance
      popup.value = new Popup({
        closeButton: true,
        closeOnClick: false
      });
      
    } catch (error) {
      messageStore.showError('Failed to initialize map', error as Error);
    }
  };
  
  // Load POIs on map
  const loadPOIsOnMap = async () => {
    if (!map.value || !isMapLoaded.value) return;
    
    try {
      clearMarkers();
      
      filteredPOIs.value.forEach(poi => {
        const marker = new Marker({
          color: getCategoryColor(poi.category)
        })
        .setLngLat([poi.long, poi.lat])
        .addTo(map.value!);
        
        // Add click event to show popup
        marker.getElement().addEventListener('click', () => {
          showPOIPopup(poi);
        });
        
        markers.value.push(marker);
      });
      
      // Fit map to bounds
      if (mapBounds.value) {
        fitMapToBounds(mapBounds.value);
      }
      
    } catch (error) {
      messageStore.showError('Failed to load POIs on map', error as Error);
    }
  };
  
  // Clear all markers
  const clearMarkers = () => {
    markers.value.forEach(marker => marker.remove());
    markers.value = [];
  };
  
  // Show POI popup
  const showPOIPopup = (poi: POIModel) => {
    if (!popup.value || !map.value) return;
    
    const popupContent = `
      <div class="poi-popup">
        <h3 class="font-bold text-lg">${poi.name}</h3>
        <p class="text-sm text-gray-600">${poi.category}</p>
        <div class="mt-2 text-xs">
          <p><strong>Coordinates:</strong> ${poi.lat.toFixed(6)}, ${poi.long.toFixed(6)}</p>
          <p><strong>Created:</strong> ${poi.created_at.toLocaleDateString()}</p>
          ${poi.modified_at ? `<p><strong>Modified:</strong> ${poi.modified_at.toLocaleDateString()}</p>` : ''}
        </div>
      </div>
    `;
    
    popup.value
      .setLngLat([poi.long, poi.lat])
      .setHTML(popupContent)
      .addTo(map.value);
  };
  
  // Fit map to bounds
  const fitMapToBounds = (bounds: MapBounds) => {
    if (!map.value) return;
    
    const mapBounds = new LngLatBounds(
      [bounds.west, bounds.south],
      [bounds.east, bounds.north]
    );
    
    map.value.fitBounds(mapBounds, {
      padding: 50,
      maxZoom: 15
    });
  };
  
  // Get category color
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Restaurant': '#ef4444',
      'Hotel': '#3b82f6',
      'Shop': '#10b981',
      'Park': '#22c55e',
      'Museum': '#8b5cf6',
      'Hospital': '#f59e0b',
      'School': '#06b6d4',
      'Gas Station': '#64748b'
    };
    
    return colors[category] || '#6b7280';
  };
  
  // Set category filter
  const setCategoryFilter = (category: string | undefined) => {
    selectedCategory.value = category;
    loadPOIsOnMap();
  };
  
  // Refresh map
  const refreshMap = async () => {
    await poiStore.fetchPOIs();
    loadPOIsOnMap();
  };
  
  // Close popup
  const closePopup = () => {
    if (popup.value) {
      popup.value.remove();
    }
  };
  
  // Resize map
  const resizeMap = () => {
    if (map.value) {
      map.value.resize();
    }
  };
  
  // Watch for POI changes
  watch(
    () => poiStore.pois,
    () => {
      if (isMapLoaded.value) {
        loadPOIsOnMap();
      }
    },
    { deep: true }
  );
  
  // Watch for category filter changes
  watch(
    () => selectedCategory.value,
    () => {
      if (isMapLoaded.value) {
        loadPOIsOnMap();
      }
    }
  );
  
  // Lifecycle hooks
  onMounted(() => {
    initializeMap();
  });
  
  onUnmounted(() => {
    if (map.value) {
      map.value.remove();
    }
  });
  
  return {
    // State
    map,
    isMapLoaded,
    selectedCategory,
    
    // Computed
    filteredPOIs,
    availableCategories,
    mapBounds,
    
    // Actions
    initializeMap,
    loadPOIsOnMap,
    clearMarkers,
    showPOIPopup,
    fitMapToBounds,
    setCategoryFilter,
    refreshMap,
    closePopup,
    resizeMap
  };
} 