import { POI, CreatePOIRequest, UpdatePOIRequest } from '../entities/POI';
import { IPOIRepository } from '../repositories/IPOIRepository';

export class POIService {
  constructor(private readonly repository: IPOIRepository) {}

  async getAllPOIs(): Promise<POI[]> {
    return this.repository.getAll();
  }

  async getPOIById(id: string): Promise<POI> {
    return this.repository.getById(id);
  }

  async createPOI(poi: CreatePOIRequest): Promise<POI> {
    // Add any business logic validation here if needed
    if (!poi.name.trim()) {
      throw new Error('POI name is required');
    }
    if (!poi.category.trim()) {
      throw new Error('POI category is required');
    }
    if (poi.lat < -90 || poi.lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (poi.long < -180 || poi.long > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    return this.repository.create(poi);
  }

  async updatePOI(poi: UpdatePOIRequest): Promise<POI> {
    // Add any business logic validation here if needed
    if (!poi.name.trim()) {
      throw new Error('POI name is required');
    }
    if (!poi.category.trim()) {
      throw new Error('POI category is required');
    }
    if (poi.lat < -90 || poi.lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (poi.long < -180 || poi.long > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    return this.repository.update(poi);
  }

  async deletePOI(id: string): Promise<void> {
    if (!id.trim()) {
      throw new Error('POI ID is required');
    }
    return this.repository.delete(id);
  }

  async importPOIsFromCSV(file: File): Promise<void> {
    if (!file) {
      throw new Error('File is required');
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('File must be a CSV file');
    }
    return this.repository.bulkImportCSV(file);
  }
} 