export interface POI {
  id: string;
  name: string;
  category: string;
  lat: number;
  long: number;
  created_at: Date;
  modified_at?: Date;
  deleted_at?: Date;
}

export interface POICreateRequest {
  name: string;
  category: string;
  lat: number;
  long: number;
}

export interface POIUpdateRequest {
  id: string;
  name: string;
  category: string;
  lat: number;
  long: number;
}

export interface POIBulkCreateRequest {
  pois: POICreateRequest[];
}

export class POIModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly category: string,
    public readonly lat: number,
    public readonly long: number,
    public readonly created_at: Date,
    public readonly modified_at?: Date,
    public readonly deleted_at?: Date
  ) {}

  static fromApiResponse(data: any): POIModel {
    return new POIModel(
      data.id,
      data.name,
      data.category,
      data.lat,
      data.long,
      new Date(data.created_at),
      data.modified_at ? new Date(data.modified_at) : undefined,
      data.deleted_at ? new Date(data.deleted_at) : undefined
    );
  }

  toGeoJSONFeature() {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.long, this.lat]
      },
      properties: {
        id: this.id,
        name: this.name,
        category: this.category,
        created_at: this.created_at.toISOString(),
        modified_at: this.modified_at?.toISOString()
      }
    };
  }

  isValidCoordinates(): boolean {
    return this.lat >= -90 && this.lat <= 90 && 
           this.long >= -180 && this.long <= 180;
  }
} 