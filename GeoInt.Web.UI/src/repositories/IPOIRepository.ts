import { POI, CreatePOIRequest, UpdatePOIRequest } from '../entities/POI';
import { IRepository } from './IRepository';

export interface IPOIRepository extends IRepository<POI, string> {
  bulkImportCSV(file: File): Promise<void>;
} 