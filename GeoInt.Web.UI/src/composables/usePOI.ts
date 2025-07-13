import { ref, computed, reactive } from 'vue';
import { POIModel, POICreateRequest, POIUpdateRequest, POIBulkCreateRequest } from '@/models/POI';
import { FilterOptions, SortOptions } from '@/types/common';
import { usePOIStore } from '@/stores/poiStore';
import { useMessageStore } from '@/stores/messageStore';

export function usePOI() {
  const poiStore = usePOIStore();
  const messageStore = useMessageStore();
  
  // Reactive state
  const isLoading = ref(false);
  const selectedPOI = ref<POIModel | null>(null);
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const showDeleteConfirmation = ref(false);
  
  // Reactive filters and sorting
  const filters = reactive<FilterOptions>({
    category: undefined,
    searchTerm: ''
  });
  
  const sorting = reactive<SortOptions>({
    field: 'name',
    direction: 'asc'
  });
  
  // Computed properties
  const filteredPOIs = computed(() => {
    let result = poiStore.pois;
    
    if (filters.category) {
      result = result.filter(poi => poi.category === filters.category);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(poi => 
        poi.name.toLowerCase().includes(term) || 
        poi.category.toLowerCase().includes(term)
      );
    }
    
    return result.sort((a, b) => {
      const aValue = a[sorting.field as keyof POIModel];
      const bValue = b[sorting.field as keyof POIModel];
      
      if (sorting.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  });
  
  const availableCategories = computed(() => {
    const categories = new Set(poiStore.pois.map(poi => poi.category));
    return Array.from(categories).sort();
  });
  
  const totalPOIs = computed(() => poiStore.pois.length);
  const filteredPOICount = computed(() => filteredPOIs.value.length);
  
  // Actions
  const loadPOIs = async () => {
    try {
      isLoading.value = true;
      await poiStore.fetchPOIs();
    } catch (error) {
      messageStore.showError('Failed to load POIs', error as Error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const createPOI = async (request: POICreateRequest) => {
    try {
      isLoading.value = true;
      await poiStore.createPOI(request);
      messageStore.showSuccess('POI created successfully');
      showCreateModal.value = false;
    } catch (error) {
      messageStore.showError('Failed to create POI', error as Error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  const updatePOI = async (request: POIUpdateRequest) => {
    try {
      isLoading.value = true;
      await poiStore.updatePOI(request);
      messageStore.showSuccess('POI updated successfully');
      showEditModal.value = false;
      selectedPOI.value = null;
    } catch (error) {
      messageStore.showError('Failed to update POI', error as Error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  const deletePOI = async (id: string) => {
    try {
      isLoading.value = true;
      await poiStore.deletePOI(id);
      messageStore.showSuccess('POI deleted successfully');
      showDeleteConfirmation.value = false;
      selectedPOI.value = null;
    } catch (error) {
      messageStore.showError('Failed to delete POI', error as Error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const bulkCreatePOIs = async (request: POIBulkCreateRequest) => {
    try {
      isLoading.value = true;
      await poiStore.bulkCreatePOIs(request);
      messageStore.showSuccess(`${request.pois.length} POIs imported successfully`);
    } catch (error) {
      messageStore.showError('Failed to import POIs', error as Error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Modal controls
  const openCreateModal = () => {
    showCreateModal.value = true;
  };
  
  const openEditModal = (poi: POIModel) => {
    selectedPOI.value = poi;
    showEditModal.value = true;
  };
  
  const openDeleteConfirmation = (poi: POIModel) => {
    selectedPOI.value = poi;
    showDeleteConfirmation.value = true;
  };
  
  const closeModals = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    showDeleteConfirmation.value = false;
    selectedPOI.value = null;
  };
  
  // Filter controls
  const setCategory = (category: string | undefined) => {
    filters.category = category;
  };
  
  const setSearchTerm = (term: string) => {
    filters.searchTerm = term;
  };
  
  const setSorting = (field: string, direction: 'asc' | 'desc') => {
    sorting.field = field;
    sorting.direction = direction;
  };
  
  const clearFilters = () => {
    filters.category = undefined;
    filters.searchTerm = '';
  };
  
  return {
    // State
    isLoading,
    selectedPOI,
    showCreateModal,
    showEditModal,
    showDeleteConfirmation,
    filters,
    sorting,
    
    // Computed
    filteredPOIs,
    availableCategories,
    totalPOIs,
    filteredPOICount,
    
    // Actions
    loadPOIs,
    createPOI,
    updatePOI,
    deletePOI,
    bulkCreatePOIs,
    
    // Modal controls
    openCreateModal,
    openEditModal,
    openDeleteConfirmation,
    closeModals,
    
    // Filter controls
    setCategory,
    setSearchTerm,
    setSorting,
    clearFilters
  };
} 