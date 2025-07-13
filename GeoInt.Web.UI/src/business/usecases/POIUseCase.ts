import { POIModel, POICreateRequest, POIUpdateRequest, POIBulkCreateRequest } from '@/models/POI';
import { ValidationResult, FilterOptions, SortOptions, GeoJSONFeatureCollection, MapBounds } from '@/types/common';
import { IPOIRepository } from '../repositories/IPOIRepository';
import { IValidationService } from '../services/IValidationService';
import { IMessageService } from '../services/IMessageService';

export class POIUseCase {
  constructor(
    private readonly poiRepository: IPOIRepository,
    private readonly validationService: IValidationService,
    private readonly messageService: IMessageService
  ) {}

  async getAllPOIs(filters?: FilterOptions, sort?: SortOptions): Promise<POIModel[]> {
    try {
      const pois = await this.poiRepository.getAll(filters, sort);
      return pois.map(poi => POIModel.fromApiResponse(poi));
    } catch (error) {
      this.messageService.showError('Failed to load POIs', error as Error);
      throw error;
    }
  }

  async getPOIById(id: string): Promise<POIModel | null> {
    try {
      const poi = await this.poiRepository.getById(id);
      return poi ? POIModel.fromApiResponse(poi) : null;
    } catch (error) {
      this.messageService.showError('Failed to load POI', error as Error);
      throw error;
    }
  }

  async createPOI(request: POICreateRequest): Promise<POIModel> {
    const validation = this.validationService.validatePOICreate(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const createdPOI = await this.poiRepository.create(request);
      this.messageService.showSuccess('POI created successfully');
      return POIModel.fromApiResponse(createdPOI);
    } catch (error) {
      this.messageService.showError('Failed to create POI', error as Error);
      throw error;
    }
  }

  async updatePOI(request: POIUpdateRequest): Promise<POIModel> {
    const validation = this.validationService.validatePOIUpdate(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const updatedPOI = await this.poiRepository.update(request);
      this.messageService.showSuccess('POI updated successfully');
      return POIModel.fromApiResponse(updatedPOI);
    } catch (error) {
      this.messageService.showError('Failed to update POI', error as Error);
      throw error;
    }
  }

  async deletePOI(id: string): Promise<void> {
    try {
      await this.poiRepository.delete(id);
      this.messageService.showSuccess('POI deleted successfully');
    } catch (error) {
      this.messageService.showError('Failed to delete POI', error as Error);
      throw error;
    }
  }

  async bulkCreatePOIs(request: POIBulkCreateRequest): Promise<POIModel[]> {
    const validation = this.validationService.validatePOIBulkCreate(request);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      const createdPOIs = await this.poiRepository.bulkCreate(request);
      this.messageService.showSuccess(`${createdPOIs.length} POIs created successfully`);
      return createdPOIs.map(poi => POIModel.fromApiResponse(poi));
    } catch (error) {
      this.messageService.showError('Failed to import POIs', error as Error);
      throw error;
    }
  }

  async getPOIsAsGeoJSON(): Promise<GeoJSONFeatureCollection> {
    try {
      const pois = await this.getAllPOIs();
      const features = pois.map(poi => poi.toGeoJSONFeature());
      
      return {
        type: 'FeatureCollection',
        features
      };
    } catch (error) {
      this.messageService.showError('Failed to load POIs for map', error as Error);
      throw error;
    }
  }

  getAvailableCategories(pois: POIModel[]): string[] {
    const categories = new Set(pois.map(poi => poi.category));
    return Array.from(categories).sort();
  }

  calculateMapBounds(pois: POIModel[]): MapBounds | null {
    if (pois.length === 0) return null;

    const lats = pois.map(poi => poi.lat);
    const longs = pois.map(poi => poi.long);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...longs),
      west: Math.min(...longs)
    };
  }

  filterPOIsByCategory(pois: POIModel[], category: string): POIModel[] {
    return pois.filter(poi => poi.category === category);
  }

  searchPOIs(pois: POIModel[], searchTerm: string): POIModel[] {
    const term = searchTerm.toLowerCase();
    return pois.filter(poi => 
      poi.name.toLowerCase().includes(term) || 
      poi.category.toLowerCase().includes(term)
    );
  }

  sortPOIs(pois: POIModel[], sort: SortOptions): POIModel[] {
    return [...pois].sort((a, b) => {
      const aValue = a[sort.field as keyof POIModel];
      const bValue = b[sort.field as keyof POIModel];
      
      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }
} 