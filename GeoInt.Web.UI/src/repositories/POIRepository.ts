import { IPOIRepository } from './IPOIRepository'
import { POI } from '../entities/POI'

export class POIRepository implements IPOIRepository {
  private baseUrl = 'http://localhost:5008/api/pois'

  async getAll(): Promise<POI[]> {
    const response = await fetch(this.baseUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async getById(id: string): Promise<POI> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async create(poi: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>): Promise<POI> {
    console.log('POIRepository: Creating POI with data:', poi)
    console.log('POIRepository: Sending to API:', JSON.stringify(poi))
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(poi),
    })
    
    console.log('POIRepository: API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('POIRepository: API error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('POIRepository: API returned:', result)
    return result
  }

  async update(poi: POI): Promise<POI> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(poi),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }

  async importFromCSV(file: File): Promise<{ success: boolean; count: number }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/bulk-csv`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getGeoJson(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/togeojson`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
} 