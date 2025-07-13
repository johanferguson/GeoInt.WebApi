import { ref, computed } from 'vue';
import { POI, CreatePOIRequest, UpdatePOIRequest } from '../entities/POI';
import { POIService } from '../services/POIService';
import { POIRepository } from '../repositories/POIRepository';
import { useNotifications } from './useNotifications';

// Create service instance
const repository = new POIRepository();
const service = new POIService(repository);

export function usePOI() {
  const { showSuccess, showError } = useNotifications();
  
  // State
  const pois = ref<POI[]>([]);
  const currentPOI = ref<POI | null>(null);
  const isLoading = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const isDeleting = ref(false);
  const isImporting = ref(false);

  // Computed
  const totalPOIs = computed(() => pois.value.length);
  const categories = computed(() => {
    const uniqueCategories = [...new Set(pois.value.map(poi => poi.category))];
    return uniqueCategories.sort();
  });

  // Actions
  const loadPOIs = async () => {
    isLoading.value = true;
    try {
      pois.value = await service.getAllPOIs();
      showSuccess('POIs loaded successfully', `Loaded ${pois.value.length} POIs`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to load POIs', message);
      console.error('Error loading POIs:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const loadPOIById = async (id: string) => {
    isLoading.value = true;
    try {
      currentPOI.value = await service.getPOIById(id);
      showSuccess('POI loaded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to load POI', message);
      console.error('Error loading POI:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const createPOI = async (poi: CreatePOIRequest) => {
    isCreating.value = true;
    try {
      const newPOI = await service.createPOI(poi);
      pois.value.push(newPOI);
      showSuccess('POI created successfully', `Created "${newPOI.name}"`);
      return newPOI;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to create POI', message);
      console.error('Error creating POI:', error);
      throw error;
    } finally {
      isCreating.value = false;
    }
  };

  const updatePOI = async (poi: UpdatePOIRequest) => {
    isUpdating.value = true;
    try {
      const updatedPOI = await service.updatePOI(poi);
      const index = pois.value.findIndex(p => p.id === poi.id);
      if (index !== -1) {
        pois.value[index] = updatedPOI;
      }
      showSuccess('POI updated successfully', `Updated "${updatedPOI.name}"`);
      return updatedPOI;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to update POI', message);
      console.error('Error updating POI:', error);
      throw error;
    } finally {
      isUpdating.value = false;
    }
  };

  const deletePOI = async (id: string) => {
    isDeleting.value = true;
    try {
      await service.deletePOI(id);
      const deletedPOI = pois.value.find(p => p.id === id);
      pois.value = pois.value.filter(p => p.id !== id);
      showSuccess('POI deleted successfully', deletedPOI ? `Deleted "${deletedPOI.name}"` : undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to delete POI', message);
      console.error('Error deleting POI:', error);
      throw error;
    } finally {
      isDeleting.value = false;
    }
  };

  const importPOIsFromCSV = async (file: File) => {
    isImporting.value = true;
    try {
      await service.importPOIsFromCSV(file);
      showSuccess('CSV imported successfully', 'POIs have been imported from CSV file');
      // Reload POIs to get the updated list
      await loadPOIs();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to import CSV', message);
      console.error('Error importing CSV:', error);
      throw error;
    } finally {
      isImporting.value = false;
    }
  };

  return {
    // State
    pois,
    currentPOI,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting,
    
    // Computed
    totalPOIs,
    categories,
    
    // Actions
    loadPOIs,
    loadPOIById,
    createPOI,
    updatePOI,
    deletePOI,
    importPOIsFromCSV,
  };
} 