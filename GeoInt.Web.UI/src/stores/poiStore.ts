import { defineStore } from 'pinia';
import { POIModel, POICreateRequest, POIUpdateRequest, POIBulkCreateRequest } from '@/models/POI';
import { POIRepository } from '@/services/POIRepository';
import { ValidationService } from '@/services/ValidationService';

export const usePOIStore = defineStore('poi', {
  state: () => ({
    pois: [] as POIModel[],
    isLoading: false,
    error: null as string | null,
    lastFetched: null as Date | null
  }),
  
  getters: {
    getPOIById: (state) => (id: string) => {
      return state.pois.find(poi => poi.id === id);
    },
    
    getPOIsByCategory: (state) => (category: string) => {
      return state.pois.filter(poi => poi.category === category);
    },
    
    getCategories: (state) => {
      const categories = new Set(state.pois.map(poi => poi.category));
      return Array.from(categories).sort();
    },
    
    getTotalCount: (state) => state.pois.length,
    
    getRecentPOIs: (state) => {
      return [...state.pois]
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, 10);
    }
  },
  
  actions: {
    async fetchPOIs() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const repository = new POIRepository();
        const poisData = await repository.getAll();
        
        this.pois = poisData.map(poi => POIModel.fromApiResponse(poi));
        this.lastFetched = new Date();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch POIs';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createPOI(request: POICreateRequest) {
      // Validate request
      const validator = new ValidationService();
      const validation = validator.validatePOICreate(request);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      try {
        const repository = new POIRepository();
        const createdPOI = await repository.create(request);
        
        const newPOI = POIModel.fromApiResponse(createdPOI);
        this.pois.push(newPOI);
        
        return newPOI;
      } catch (error) {
        throw error;
      }
    },
    
    async updatePOI(request: POIUpdateRequest) {
      // Validate request
      const validator = new ValidationService();
      const validation = validator.validatePOIUpdate(request);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      try {
        const repository = new POIRepository();
        const updatedPOI = await repository.update(request);
        
        const index = this.pois.findIndex(poi => poi.id === request.id);
        if (index !== -1) {
          this.pois[index] = POIModel.fromApiResponse(updatedPOI);
        }
        
        return this.pois[index];
      } catch (error) {
        throw error;
      }
    },
    
    async deletePOI(id: string) {
      try {
        const repository = new POIRepository();
        await repository.delete(id);
        
        const index = this.pois.findIndex(poi => poi.id === id);
        if (index !== -1) {
          this.pois.splice(index, 1);
        }
      } catch (error) {
        throw error;
      }
    },
    
    async bulkCreatePOIs(request: POIBulkCreateRequest) {
      // Validate request
      const validator = new ValidationService();
      const validation = validator.validatePOIBulkCreate(request);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      try {
        const repository = new POIRepository();
        const createdPOIs = await repository.bulkCreate(request);
        
        const newPOIs = createdPOIs.map(poi => POIModel.fromApiResponse(poi));
        this.pois.push(...newPOIs);
        
        return newPOIs;
      } catch (error) {
        throw error;
      }
    },
    
    async refreshPOIs() {
      await this.fetchPOIs();
    },
    
    clearPOIs() {
      this.pois = [];
      this.lastFetched = null;
    },
    
    clearError() {
      this.error = null;
    }
  }
}); 