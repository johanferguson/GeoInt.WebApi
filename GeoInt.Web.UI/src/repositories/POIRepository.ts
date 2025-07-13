import { POI, CreatePOIRequest, UpdatePOIRequest } from '../entities/POI';
import { IPOIRepository } from './IPOIRepository';

export class POIRepository implements IPOIRepository {
  private readonly baseUrl = 'http://localhost:5008/api/pois';

  async getAll(): Promise<POI[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch POIs: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getById(id: string): Promise<POI> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch POI: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async create(item: CreatePOIRequest): Promise<POI> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error(`Failed to create POI: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async update(item: UpdatePOIRequest): Promise<POI> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error(`Failed to update POI: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete POI: ${response.status} ${response.statusText}`);
    }
  }

  async bulkImportCSV(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/bulk-csv`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to import CSV: ${response.status} ${response.statusText}`);
    }
  }
} 