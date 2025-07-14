<template>
  <div></div>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { Popup, LngLatBounds } from 'maplibre-gl'
import { usePOI } from '../../composables/usePOI'
import { POI_CATEGORY_COLORS } from '../../constants/poiCategories'

interface Props {
  map: any
  isMapLoaded: boolean
  selectedCategory?: string | null
  isAddMode?: boolean
}

interface Emits {
  (e: 'coordinates-selected', coordinates: [number, number]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getPOIsAsGeoJson, isLoadingGeoJson, deletePOI, loadPOIs, pois, getPOIsAsGeoJsonFromArray } = usePOI()

let geoJsonData: any = null
let currentPopup: any = null

// Global delete handler function
const handleDeletePOI = async (poiId: string, poiName: string) => {
  showDeleteConfirmation(poiId, poiName)
}

const showDeleteConfirmation = (poiId: string, poiName: string) => {
  // Create modal HTML
  const modalHTML = `
    <div id="delete-confirmation-modal" class="delete-modal-overlay">
      <div class="delete-modal-content">
        <div class="delete-modal-header">
          <div class="delete-modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/>
            </svg>
          </div>
          <h3 class="delete-modal-title">Delete POI</h3>
        </div>
        <div class="delete-modal-body">
          <p class="delete-modal-message">Are you sure you want to delete <strong>"${poiName}"</strong>?</p>
          <p class="delete-modal-warning">This action cannot be undone.</p>
        </div>
        <div class="delete-modal-actions">
          <button class="delete-modal-cancel" onclick="closeDeleteModal()">Cancel</button>
          <button class="delete-modal-confirm" onclick="confirmDeletePOI('${poiId}', '${poiName}')">Delete</button>
        </div>
      </div>
    </div>
    
    <style>
      .delete-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: modalFadeIn 0.2s ease-out;
      }
      
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .delete-modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 420px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        animation: modalSlideIn 0.3s ease-out;
      }
      
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .delete-modal-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 24px 16px 24px;
        border-bottom: 1px solid #f1f5f9;
      }
      
      .delete-modal-icon {
        width: 40px;
        height: 40px;
        background: #fef2f2;
        color: #dc2626;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
             .delete-modal-title {
         font-size: 24px;
         font-weight: 600;
         color: #1f2937;
         margin: 0;
       }
       
       .delete-modal-body {
         padding: 24px 24px;
       }
       
       .delete-modal-message {
         font-size: 18px;
         color: #374151;
         margin: 0 0 12px 0;
         line-height: 1.5;
       }
       
       .delete-modal-warning {
         font-size: 16px;
         color: #6b7280;
         margin: 0;
       }
      
      .delete-modal-actions {
        display: flex;
        gap: 12px;
        padding: 16px 24px 24px 24px;
        justify-content: flex-end;
      }
      
             .delete-modal-cancel {
         padding: 12px 24px;
         background: #f8fafc;
         color: #64748b;
         border: 1px solid #e2e8f0;
         border-radius: 8px;
         font-size: 16px;
         font-weight: 500;
         cursor: pointer;
         transition: all 0.2s ease;
       }
       
       .delete-modal-cancel:hover {
         background: #f1f5f9;
         border-color: #cbd5e1;
       }
       
       .delete-modal-confirm {
         padding: 12px 24px;
         background: #dc2626;
         color: white;
         border: none;
         border-radius: 8px;
         font-size: 16px;
         font-weight: 500;
         cursor: pointer;
         transition: all 0.2s ease;
       }
      
      .delete-modal-confirm:hover {
        background: #b91c1c;
      }
    </style>
  `
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML)
}

const confirmDeletePOI = async (poiId: string, poiName: string) => {
  closeDeleteModal()
  
  try {
    await deletePOI(poiId)
    
    // Close the current popup
    if (currentPopup) {
      currentPopup.remove()
      currentPopup = null
    }
    
    // Refresh the POI data in the composable (this will update CategoryFilter)
    await loadPOIs()
    
    // Refresh the POI layer to reflect the deletion (without auto-zoom)
    await addPOILayer(false, false) // Use API data for delete to ensure consistency
    
    // Show success toast
    showToast(`"${poiName}" has been deleted successfully`, 'success')
    
  } catch (error) {
    // Show error toast
    showToast('Failed to delete POI. Please try again.', 'error')
  }
}

const closeDeleteModal = () => {
  const modal = document.getElementById('delete-confirmation-modal')
  if (modal) {
    modal.remove()
  }
}

const showErrorMessage = (message: string) => {
  const errorHTML = `
    <div id="error-message-modal" class="delete-modal-overlay">
      <div class="delete-modal-content">
        <div class="delete-modal-header">
          <div class="delete-modal-icon" style="background: #fef2f2; color: #dc2626;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 class="delete-modal-title">Error</h3>
        </div>
                 <div class="delete-modal-body">
           <p class="delete-modal-message" style="font-size: 18px;">${message}</p>
         </div>
         <div class="delete-modal-actions">
           <button class="delete-modal-cancel" onclick="closeErrorModal()" style="font-size: 16px; padding: 12px 24px;">OK</button>
         </div>
      </div>
    </div>
  `
  
  document.body.insertAdjacentHTML('beforeend', errorHTML)
}

const closeErrorModal = () => {
  const modal = document.getElementById('error-message-modal')
  if (modal) {
    modal.remove()
  }
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // Remove any existing toast
  const existingToast = document.getElementById('poi-toast')
  if (existingToast) {
    existingToast.remove()
  }
  
  const toastColor = type === 'success' ? '#3b82f6' : '#ef4444'
  const toastIcon = type === 'success' 
    ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
    : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
  
  const toastHTML = `
    <div id="poi-toast" class="poi-toast-container">
      <div class="poi-toast-content">
        <div class="poi-toast-icon" style="color: ${toastColor};">
          ${toastIcon}
        </div>
        <span class="poi-toast-message">${message}</span>
      </div>
    </div>
    
    <style>
      .poi-toast-container {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20000;
        animation: toastSlideIn 0.4s ease-out;
      }
      
      @keyframes toastSlideIn {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      
      @keyframes toastSlideOut {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
      }
      
      .poi-toast-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px 28px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 320px;
        max-width: 500px;
      }
      
      .poi-toast-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .poi-toast-message {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.4;
      }
    </style>
  `
  
  // Add toast to page
  document.body.insertAdjacentHTML('beforeend', toastHTML)
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    const toast = document.getElementById('poi-toast')
    if (toast) {
      toast.style.animation = 'toastSlideOut 0.3s ease-out'
      setTimeout(() => {
        toast.remove()
      }, 300)
    }
  }, 4000)
}

// Make the functions globally available for onclick handlers
;(window as any).handleDeletePOI = handleDeletePOI
;(window as any).confirmDeletePOI = confirmDeletePOI
;(window as any).closeDeleteModal = closeDeleteModal
;(window as any).closeErrorModal = closeErrorModal
;(window as any).showToast = showToast



const addPOILayer = async (shouldAutoZoom: boolean = true, useReactiveData: boolean = false) => {
  if (!props.map || !props.isMapLoaded || !props.map.getSource || !props.map.getLayer || !props.map.addSource) {
    return
  }

  try {
    // Load GeoJSON data - use reactive data for immediate updates, API data for initial load
    if (useReactiveData) {
      geoJsonData = getPOIsAsGeoJsonFromArray()
    } else {
      geoJsonData = await getPOIsAsGeoJson()
    }
    
    if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) {
      return
    }
    
    // Double-check map is still available after async operation
    if (!props.map || !props.map.getSource || !props.map.getLayer) {
      return
    }
    
    // Check if source already exists and update it, otherwise create new
    if (props.map.getSource('pois')) {
      // Try using setData method first
      try {
        props.map.getSource('pois').setData(geoJsonData)
      } catch (error) {
        // Fallback: remove and re-add the source
        if (props.map.getLayer('poi-points')) {
          props.map.removeLayer('poi-points')
        }
        props.map.removeSource('pois')
        
        props.map.addSource('pois', {
          type: 'geojson',
          data: geoJsonData
        })
      }
      
      // Force map to repaint to ensure visual update
      props.map.triggerRepaint()
      
      // If layer already exists, we're done
      if (props.map.getLayer('poi-points')) {
        // Force layer to re-render by toggling visibility
        props.map.setLayoutProperty('poi-points', 'visibility', 'none')
        setTimeout(() => {
          props.map.setLayoutProperty('poi-points', 'visibility', 'visible')
        }, 50)
        
        return
      }
    } else {
      // Add source for the first time
      props.map.addSource('pois', {
        type: 'geojson',
        data: geoJsonData
      })
    }

    // Add circle layer for POI points with category-based colors (only if it doesn't exist)
    if (!props.map.getLayer('poi-points')) {
      props.map.addLayer({
      id: 'poi-points',
      type: 'circle',
      source: 'pois',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'case',
          ['has', ['downcase', ['get', 'category']], ['literal', POI_CATEGORY_COLORS]],
          ['get', ['downcase', ['get', 'category']], ['literal', POI_CATEGORY_COLORS]],
          POI_CATEGORY_COLORS.default
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })
    }

    // Add click handler for popups
    props.map.on('click', 'poi-points', (e: any) => {
      
      // Close any existing popup before opening a new one
      if (currentPopup) {
        currentPopup.remove()
        currentPopup = null
      }
      
      const coordinates = e.features[0].geometry.coordinates.slice()
      const properties = e.features[0].properties
      const categoryColor = POI_CATEGORY_COLORS[properties.category.toLowerCase()] || POI_CATEGORY_COLORS.default

      // Create stylish popup content with animations and transparency
      const popupContent = `
        <div class="poi-popup-container">
          <div class="poi-popup-header">
            <div class="poi-popup-icon" style="background-color: ${categoryColor}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 class="poi-popup-title">${properties.name}</h3>
          </div>
          
          <div class="poi-popup-content">
            <div class="poi-popup-item">
              <div class="poi-popup-label">Category</div>
              <div class="poi-popup-category-text">
                ${properties.category}
              </div>
            </div>
            
            <div class="poi-popup-item">
              <div class="poi-popup-label">Coordinates</div>
              <div class="poi-popup-coordinates">
                ${coordinates[1].toFixed(4)}°, ${coordinates[0].toFixed(4)}°
              </div>
            </div>
          </div>
          
          <div class="poi-popup-actions">
            <button class="poi-delete-btn" onclick="handleDeletePOI('${properties.id}', '${properties.name}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete POI
            </button>
          </div>
        </div>
        
        <style>
          .poi-popup-container {
            min-width: 280px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
            animation: popupSlideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          @keyframes popupSlideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
                     .poi-popup-header {
             display: flex;
             align-items: center;
             gap: 12px;
             padding: 20px 50px 16px 20px;
             background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
             border-bottom: 1px solid rgba(0, 0, 0, 0.05);
           }
          
          .poi-popup-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            flex-shrink: 0;
          }
          
                     .poi-popup-title {
             font-size: 20px;
             font-weight: 700;
             color: #1a202c;
             margin: 0;
             line-height: 1.2;
             flex: 1;
             word-wrap: break-word;
             overflow-wrap: break-word;
             max-width: calc(100% - 40px);
           }
          
          .poi-popup-content {
            padding: 16px 20px 20px 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .poi-popup-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .poi-popup-label {
            font-size: 14px;
            font-weight: 600;
            color: #4a5568;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
                     .poi-popup-category-text {
             font-size: 16px;
             font-weight: 500;
             color: #2d3748;
             padding: 4px 0;
           }
          
                     .poi-popup-coordinates {
             font-size: 16px;
             font-weight: 500;
             color: #2d3748;
             background: rgba(0, 0, 0, 0.03);
             padding: 10px 16px;
             border-radius: 12px;
             font-family: 'Monaco', 'Menlo', monospace;
             border: 1px solid rgba(0, 0, 0, 0.05);
           }
           
           .poi-popup-actions {
             padding: 16px 20px 20px 20px;
             border-top: 1px solid rgba(0, 0, 0, 0.05);
             background: rgba(0, 0, 0, 0.02);
           }
           
           .poi-delete-btn {
             width: 100%;
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 8px;
             padding: 12px 16px;
             background: linear-gradient(135deg, #ef4444, #dc2626);
             color: white;
             border: none;
             border-radius: 12px;
             font-size: 15px;
             font-weight: 600;
             cursor: pointer;
             transition: all 0.2s ease;
             box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
           }
           
           .poi-delete-btn:hover {
             background: linear-gradient(135deg, #dc2626, #b91c1c);
             transform: translateY(-1px);
             box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
           }
           
           .poi-delete-btn:active {
             transform: translateY(0);
             box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
           }
          
          /* Popup arrow styling */
          .maplibregl-popup-tip {
            border-top-color: rgba(255, 255, 255, 0.95) !important;
          }
          
                     /* Remove default popup styling */
           .maplibregl-popup-content {
             padding: 0 !important;
             border-radius: 16px !important;
             box-shadow: none !important;
             background: transparent !important;
           }
           
           /* Enhanced close button styling */
           .maplibregl-popup-close-button {
             position: absolute !important;
             top: 12px !important;
             right: 12px !important;
             width: 32px !important;
             height: 32px !important;
             background: rgba(0, 0, 0, 0.8) !important;
             color: white !important;
             border: none !important;
             border-radius: 50% !important;
             font-size: 16px !important;
             font-weight: bold !important;
             cursor: pointer !important;
             display: flex !important;
             align-items: center !important;
             justify-content: center !important;
             z-index: 1000 !important;
             transition: all 0.2s ease !important;
             box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
             animation: closeButtonFadeIn 0.3s ease-out !important;
           }
           
           @keyframes closeButtonFadeIn {
             from {
               opacity: 0;
               transform: scale(0.8);
             }
             to {
               opacity: 1;
               transform: scale(1);
             }
           }
           
           .maplibregl-popup-close-button:hover {
             background: rgba(0, 0, 0, 0.9) !important;
             transform: scale(1.1) !important;
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
           }
           
           .maplibregl-popup-close-button:active {
             transform: scale(0.95) !important;
           }
        </style>
      `

      // Create and show popup with custom styling
      currentPopup = new Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px',
        className: 'custom-poi-popup'
      })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(props.map)
        
      // Handle popup close event
      currentPopup.on('close', () => {
        currentPopup = null
      })
    })

    // Change cursor on hover
    props.map.on('mouseenter', 'poi-points', () => {
      props.map.getCanvas().style.cursor = 'pointer'
    })

    props.map.on('mouseleave', 'poi-points', () => {
      props.map.getCanvas().style.cursor = ''
    })

    // Auto-zoom to fit all POIs (only if shouldAutoZoom is true)
    if (shouldAutoZoom && geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
      const bounds = new LngLatBounds()
      
      geoJsonData.features.forEach((feature: any) => {
        const coords = feature.geometry.coordinates
        bounds.extend(coords)
      })
      props.map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      })
    }

    // Add map click handler for adding POIs
    const handleMapClick = (e: any) => {
      if (props.isAddMode) {
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat]
        emit('coordinates-selected', coordinates)
      }
    }

    // Add click handler to map
    props.map.on('click', handleMapClick)

  } catch (error) {
    // Error adding POI layer
  }
}

const removePOILayer = () => {
  if (!props.map) return

  // Close any open popup
  if (currentPopup) {
    currentPopup.remove()
    currentPopup = null
  }

  try {
    if (props.map && props.map.getLayer && props.map.getLayer('poi-points')) {
      props.map.removeLayer('poi-points')
    }
    if (props.map && props.map.getSource && props.map.getSource('pois')) {
      props.map.removeSource('pois')
    }
  } catch (error) {
    // Silently ignore errors during cleanup - map might already be destroyed
  }
}

const updateFilter = () => {
  if (!props.map || !props.map.getLayer || !props.map.getLayer('poi-points')) {
    return
  }

  try {
    if (props.selectedCategory && props.selectedCategory.trim() !== '') {
      // Create case-insensitive filter
      const filter = ['==', ['downcase', ['get', 'category']], props.selectedCategory.toLowerCase()]
      props.map.setFilter('poi-points', filter)
    } else {
      props.map.setFilter('poi-points', null)
    }
    
    // Force map to repaint to ensure changes are visible
    props.map.triggerRepaint()
  } catch (error) {
    // Error updating filter
  }
}

// Watch for map load state
watch(() => props.isMapLoaded, (loaded) => {
  if (loaded) {
    addPOILayer(true) // Auto-zoom on initial load
  }
})

// Watch for category filter changes
watch(() => props.selectedCategory, (newCategory, oldCategory) => {
  // Add a small delay to ensure the map is ready
  setTimeout(() => {
    updateFilter()
  }, 50)
}, { immediate: false })

// Watch for POI data changes and refresh the layer
watch(() => pois.value.length, (newLength, oldLength) => {
  if (props.isMapLoaded && props.map && newLength !== oldLength && newLength > oldLength) {
    // Refresh the POI layer with reactive data for immediate update
    setTimeout(() => {
      addPOILayer(false, true) // false = don't auto-zoom, true = use reactive data
    }, 100)
  }
}, { immediate: false })

onMounted(() => {
  if (props.isMapLoaded) {
    addPOILayer(true) // Auto-zoom on initial mount
  }
})

onUnmounted(() => {
  removePOILayer()
  // Clean up global functions
  delete (window as any).handleDeletePOI
  delete (window as any).confirmDeletePOI
  delete (window as any).closeDeleteModal
  delete (window as any).closeErrorModal
  delete (window as any).showToast
})
</script> 