export interface POI {
  id: string;
  name: string;
  category: string;
  lat: number;
  long: number;
  created_at: string;
  modified_at?: string;
  deleted_at?: string;
}

export interface CreatePOIRequest {
  name: string;
  category: string;
  lat: number;
  long: number;
}

export interface UpdatePOIRequest {
  id: string;
  name: string;
  category: string;
  lat: number;
  long: number;
} 