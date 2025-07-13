import { POI } from '../entities/POI'
import { IPOIRepository } from '../repositories/IPOIRepository'

export class POIService {
  constructor(private repository: IPOIRepository) {}

  async getAllPOIs(): Promise<POI[]> {
    return this.repository.getAll()
  }

  async getPOIById(id: string): Promise<POI> {
    if (!id || id.trim() === '') {
      throw new Error('POI ID is required')
    }
    return this.repository.getById(id)
  }

  async createPOI(poi: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>): Promise<POI> {
    this.validatePOI(poi)
    return this.repository.create(poi)
  }

  async updatePOI(poi: POI): Promise<POI> {
    this.validatePOI(poi)
    return this.repository.update(poi)
  }

  async deletePOI(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('POI ID is required')
    }
    return this.repository.delete(id)
  }

  async importFromCSV(file: File): Promise<{ success: boolean; count: number }> {
    if (!file) {
      throw new Error('File is required')
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Only CSV files are supported')
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size must be less than 5MB')
    }
    
    return this.repository.importFromCSV(file)
  }

  async getPOIsAsGeoJson(): Promise<any> {
    return this.repository.getGeoJson()
  }

  private validatePOI(poi: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>): void {
    this.validateName(poi.name)
    this.validateCategory(poi.category)
    this.validateLatitude(poi.lat)
    this.validateLongitude(poi.long)
  }

  private validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('POI name is required')
    }
    if (name.length > 100) {
      throw new Error('POI name must be less than 100 characters')
    }
  }

  private validateCategory(category: string): void {
    if (!category || category.trim() === '') {
      throw new Error('POI category is required')
    }
    if (category.length > 50) {
      throw new Error('POI category must be less than 50 characters')
    }
  }

  private validateLatitude(lat: number): void {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90')
    }
  }

  private validateLongitude(long: number): void {
    if (long < -180 || long > 180) {
      throw new Error('Longitude must be between -180 and 180')
    }
  }
} 