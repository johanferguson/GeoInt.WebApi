import axios, { AxiosInstance } from 'axios';
import { POI, CreatePOIRequest, UpdatePOIRequest } from '@/types/poi';

class POIApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5008/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAllPOIs(): Promise<POI[]> {
    const response = await this.api.get<POI[]>('/pois');
    return response.data;
  }

  async getPOIById(id: string): Promise<POI> {
    const response = await this.api.get<POI>(`/pois/${id}`);
    return response.data;
  }

  async createPOI(poi: CreatePOIRequest): Promise<string> {
    const response = await this.api.post<string>('/pois', poi);
    return response.data;
  }

  async updatePOI(poi: UpdatePOIRequest): Promise<void> {
    await this.api.put('/pois', poi);
  }

  async deletePOI(id: string): Promise<void> {
    await this.api.delete(`/pois/${id}`, {
      data: { Id: id }
    });
  }

  async bulkCreateFromCSV(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    await this.api.post('/pois/bulk-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async exportToCSV(): Promise<Blob> {
    const response = await this.api.get('/pois/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportToGeoJSON(): Promise<Blob> {
    const response = await this.api.get('/pois/export/geojson', {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const poiApi = new POIApiService(); 