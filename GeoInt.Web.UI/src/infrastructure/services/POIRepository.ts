import axios from 'axios';
import { POICreateRequest, POIUpdateRequest, POIBulkCreateRequest } from '@/models/POI';
import { FilterOptions, SortOptions } from '@/types/common';
import { IPOIRepository } from '@/business/repositories/IPOIRepository';

export class POIRepository implements IPOIRepository {
  private readonly baseURL = '/api/pois';
  
  async getAll(filters?: FilterOptions, sort?: SortOptions): Promise<any[]> {
    try {
      const response = await axios.get(this.baseURL, {
        params: this.buildQueryParams(filters, sort)
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch POIs');
      throw error;
    }
  }
  
  async getById(id: string): Promise<any | null> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleError(error, 'Failed to fetch POI');
      throw error;
    }
  }
  
  async create(request: POICreateRequest): Promise<any> {
    try {
      const response = await axios.post(this.baseURL, request);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create POI');
      throw error;
    }
  }
  
  async update(request: POIUpdateRequest): Promise<any> {
    try {
      const response = await axios.put(this.baseURL, request);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to update POI');
      throw error;
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      this.handleError(error, 'Failed to delete POI');
      throw error;
    }
  }
  
  async bulkCreate(request: POIBulkCreateRequest): Promise<any[]> {
    try {
      const response = await axios.post(`${this.baseURL}/bulk-csv`, request);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to import POIs');
      throw error;
    }
  }
  
  async getAsGeoJSON(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/togeojson`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch POIs as GeoJSON');
      throw error;
    }
  }
  
  async getAsCSV(): Promise<string> {
    try {
      const response = await axios.get(`${this.baseURL}/tocsv`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch POIs as CSV');
      throw error;
    }
  }
  
  private buildQueryParams(filters?: FilterOptions, sort?: SortOptions): any {
    const params: any = {};
    
    if (filters?.category) {
      params.category = filters.category;
    }
    
    if (filters?.searchTerm) {
      params.search = filters.searchTerm;
    }
    
    if (sort?.field) {
      params.sortBy = sort.field;
      params.sortOrder = sort.direction;
    }
    
    return params;
  }
  
  private handleError(error: any, defaultMessage: string): void {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 
                     error.response?.statusText || 
                     defaultMessage;
      console.error(`API Error: ${message}`, error);
    } else {
      console.error(`${defaultMessage}:`, error);
    }
  }
} 