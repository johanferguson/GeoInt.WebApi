<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
    
    <!-- Add Point Button -->
    <button 
      @click="toggleAddMode"
      :class="{ active: isAddMode }"
      class="add-point-btn"
    >
      <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" opacity="0.7"/>
      </svg>
      {{ isAddMode ? 'Cancel Add' : 'Add Point' }}
    </button>

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast-notification">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      Click where you want to add the point
    </div>

    <!-- Add POI Form Modal -->
    <div v-if="showAddForm" class="add-form-overlay" @click="cancelAdd">
      <div class="add-form-container" @click.stop>
        <div class="add-form-header">
          <h3>Add New POI</h3>
          <button @click="cancelAdd" class="close-button">×</button>
        </div>
        
        <form @submit.prevent="createPOI" class="add-form-body">
          <div class="form-group">
            <label for="poi-name" class="form-label">Name *</label>
            <input
              id="poi-name"
              v-model="newPOI.name"
              type="text"
              class="form-control"
              required
              placeholder="Enter POI name"
              ref="nameInput"
            />
          </div>
          
          <div class="form-group">
            <label for="poi-category" class="form-label">Category *</label>
            <input
              id="poi-category"
              v-model="newPOI.category"
              type="text"
              class="form-control"
              required
              placeholder="Enter category"
            />
          </div>
          
          <div class="coordinates-info">
            <strong>Location:</strong> 
            {{ newPOI.lat.toFixed(6) }}, {{ newPOI.long.toFixed(6) }}
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cancelAdd" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="saving" class="btn btn-primary">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Adding...' : 'Add POI' }}
            </button>
          </div>
        </form>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import maplibregl from 'maplibre-gl';
import { poiApi } from '@/services/api';
import { POI, CreatePOIRequest } from '@/types/poi';

const mapContainer = ref<HTMLDivElement>();
const nameInput = ref<HTMLInputElement>();

let map: maplibregl.Map;
let poisLoaded = false;
let currentPopup: maplibregl.Popup | null = null;

// Add POI functionality
const isAddMode = ref(false);
const showToast = ref(false);
const showAddForm = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

const newPOI = ref<CreatePOIRequest>({
  name: '',
  category: '',
  lat: 0,
  long: 0
});

// Add POI functions
function toggleAddMode() {
  isAddMode.value = !isAddMode.value;
  
  if (isAddMode.value) {
    showToast.value = true;
    map.getCanvas().style.cursor = 'crosshair';
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  } else {
    showToast.value = false;
    map.getCanvas().style.cursor = '';
    cancelAdd();
  }
}

function handleMapClick(e: any) {
  if (!isAddMode.value) return;
  
  const { lng, lat } = e.lngLat;
  
  // Set coordinates
  newPOI.value.lat = lat;
  newPOI.value.long = lng;
  newPOI.value.name = '';
  newPOI.value.category = '';
  
  // Hide toast and show form
  showToast.value = false;
  showAddForm.value = true;
  
  // Focus on name input after modal appears
  nextTick(() => {
    nameInput.value?.focus();
  });
}

async function createPOI() {
  saving.value = true;
  error.value = null;
  
  try {
    await poiApi.createPOI(newPOI.value);
    
    // Success - reload POIs and reset
    await loadPOIs();
    cancelAdd();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create POI';
  } finally {
    saving.value = false;
  }
}

function cancelAdd() {
  isAddMode.value = false;
  showToast.value = false;
  showAddForm.value = false;
  error.value = null;
  map.getCanvas().style.cursor = '';
  
  // Reset form
  newPOI.value = {
    name: '',
    category: '',
    lat: 0,
    long: 0
  };
}

async function handleDeletePOI(poiId: string) {
  if (!confirm('Are you sure you want to delete this POI?')) return;
  
  try {
    await poiApi.deletePOI(poiId);
    
    // Close the popup
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }
    
    // Reload POIs to refresh the map
    await loadPOIs();
  } catch (err) {
    console.error('Error deleting POI:', err);
    alert('Failed to delete POI. Please try again.');
  }
}

onMounted(async () => {
  if (!mapContainer.value) return;

  // Initialize map with South Africa bounds
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
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
    },
    center: [24.7461, -28.8166], // Center of South Africa
    zoom: 5,
    maxBounds: [
      [16.3449, -34.8191], // Southwest coordinates
      [32.8950, -22.1265]  // Northeast coordinates
    ]
  });

  map.on('load', () => {
    loadPOIs();
  });

  // Add click handler for adding POIs
  map.on('click', handleMapClick);
});

onUnmounted(() => {
  if (map) {
    map.off('click', handleMapClick);
    map.remove();
  }
});

async function loadPOIs() {
  try {
    const pois = await poiApi.getAllPOIs();
    
    if (poisLoaded) {
      // Remove existing layers and sources
      if (map.getLayer('pois')) map.removeLayer('pois');
      if (map.getSource('pois')) map.removeSource('pois');
    }

    // Create GeoJSON source
    const geojsonData = {
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
    };

    // Add source and layer
    map.addSource('pois', {
      type: 'geojson',
      data: geojsonData
    });

    map.addLayer({
      id: 'pois',
      type: 'circle',
      source: 'pois',
      paint: {
        'circle-radius': 10,
        'circle-color': '#2c3e50',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
        'circle-opacity': 0.9
      }
    });

    // Add click handler with map popup
    map.on('click', 'pois', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const properties = feature.properties;
        const coordinates = (feature.geometry as any).coordinates.slice();
        
        // Close existing popup
        if (currentPopup) {
          currentPopup.remove();
        }
        
        // Create popup content
        const popupContent = `
          <div class="map-popup">
            <div class="popup-title">
              <svg class="popup-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              ${properties.name}
            </div>
            <div class="popup-details">
              <div class="popup-row">
                <span class="popup-label">Category:</span>
                <span class="popup-value">${properties.category}</span>
              </div>
              <div class="popup-row">
                <span class="popup-label">Location:</span>
                <span class="popup-value">${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}</span>
              </div>
              <div class="popup-row">
                <span class="popup-label">Created:</span>
                <span class="popup-value">${new Date(properties.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div class="popup-actions">
              <button class="popup-delete-btn" data-poi-id="${properties.id}">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        `;
        
        // Create and add popup
        currentPopup = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: '300px'
        })
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map);
        
        // Add delete button event listener
        const deleteBtn = document.querySelector('.popup-delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const poiId = (e.target as HTMLElement).closest('.popup-delete-btn')?.getAttribute('data-poi-id');
            if (poiId) {
              await handleDeletePOI(poiId);
            }
          });
        }
      }
    });

    // Zoom to fit all POI points
    if (pois.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      pois.forEach(poi => {
        bounds.extend([poi.long, poi.lat]);
      });
      
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }

    // Change cursor on hover
    map.on('mouseenter', 'pois', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'pois', () => {
      map.getCanvas().style.cursor = '';
    });

    poisLoaded = true;
  } catch (error) {
    console.error('Error loading POIs:', error);
  }
}

// Expose method to refresh POIs from parent
defineExpose({
  refreshPOIs: loadPOIs
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
}

/* Add Point Button */
.add-point-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.3);
}

.add-point-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(44, 62, 80, 0.4);
}

.add-point-btn.active {
  background: #e74c3c;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.add-point-btn.active:hover {
  background: #c0392b;
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Toast Notification */
.toast-notification {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 1000;
  background: #2c3e50;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.toast-icon {
  width: 20px;
  height: 20px;
  color: #3498db;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Add Form Modal */
.add-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.add-form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e9ecef;
}

.add-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.add-form-header h3 {
  margin: 0;
  color: white;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.add-form-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #2c3e50;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-control {
  width: 100%;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: #f8f9fa;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
  background: white;
}

.coordinates-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #495057;
  border-left: 4px solid #2c3e50;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(44, 62, 80, 0.4);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.error-message {
  padding: 1rem 1.5rem;
  background: #f8d7da;
  color: #721c24;
  border-top: 1px solid #f1aeb5;
  margin-top: 1rem;
}

.spinner {
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<style>
/* Global styles for MapLibre popup */
.maplibregl-popup-content {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
  border: 1px solid #e9ecef !important;
}

.maplibregl-popup-close-button {
  font-size: 20px !important;
  padding: 0 !important;
  width: 25px !important;
  height: 25px !important;
  color: white !important;
  background: rgba(44, 62, 80, 0.8) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  right: 8px !important;
  top: 8px !important;
}

.maplibregl-popup-close-button:hover {
  background: rgba(44, 62, 80, 1) !important;
}

.map-popup {
  min-width: 250px;
}

.popup-title {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.5px;
}

.popup-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.popup-details {
  padding: 1rem;
  background: white;
}

.popup-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.popup-row:last-child {
  margin-bottom: 0;
}

.popup-label {
  font-weight: 600;
  color: #2c3e50;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.popup-value {
  color: #495057;
  text-align: right;
  font-weight: 500;
}

.popup-actions {
  padding: 0.75rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.popup-delete-btn {
  width: 100%;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.popup-delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.popup-delete-btn:active {
  transform: translateY(0);
}

.popup-delete-btn .btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style> 