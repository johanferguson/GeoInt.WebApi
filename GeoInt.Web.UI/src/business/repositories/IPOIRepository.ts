import { POICreateRequest, POIUpdateRequest, POIBulkCreateRequest } from '@/models/POI';
import { FilterOptions, SortOptions } from '@/types/common';

export interface IPOIRepository {
  getAll(filters?: FilterOptions, sort?: SortOptions): Promise<any[]>;
  getById(id: string): Promise<any | null>;
  create(request: POICreateRequest): Promise<any>;
  update(request: POIUpdateRequest): Promise<any>;
  delete(id: string): Promise<void>;
  bulkCreate(request: POIBulkCreateRequest): Promise<any[]>;
  getAsGeoJSON(): Promise<any>;
  getAsCSV(): Promise<string>;
} 