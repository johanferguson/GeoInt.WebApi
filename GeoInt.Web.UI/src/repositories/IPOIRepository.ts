import { IRepository } from './IRepository'
import { POI } from '../entities/POI'

export interface IPOIRepository extends IRepository<POI, string> {
  importFromCSV(file: File): Promise<{ success: boolean; count: number }>
  getGeoJson(): Promise<any>
} 