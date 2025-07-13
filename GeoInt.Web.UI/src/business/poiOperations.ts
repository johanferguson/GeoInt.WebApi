import { POI, CreatePOIRequest, UpdatePOIRequest } from '@/types/poi'
import { poiApi } from '@/services/api'
import { formatError } from '@/utils/ui'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface POIOperationResult<T = any> {
  success: boolean
  data?: T
  error?: string
  errorCode?: string
}

export interface POIFilters {
  category?: string
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
  coordinates?: {
    lat: number
    lng: number
    radius: number // in kilometers
  }
}

export interface POIStats {
  totalPOIs: number
  categoryCounts: Record<string, number>
  recentPOIs: POI[]
  averageCoordinates?: {
    lat: number
    lng: number
  }
}

/**
 * Business logic for POI operations
 */
export class POIOperations {
  private static instance: POIOperations
  private cache: Map<string, POI> = new Map()
  private lastFetchTime: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): POIOperations {
    if (!POIOperations.instance) {
      POIOperations.instance = new POIOperations()
    }
    return POIOperations.instance
  }

  /**
   * Validate POI creation data
   */
  validateCreatePOI(data: CreatePOIRequest): ValidationResult {
    const errors: string[] = []

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.push('POI name is required')
    } else if (data.name.trim().length < 2) {
      errors.push('POI name must be at least 2 characters long')
    } else if (data.name.trim().length > 100) {
      errors.push('POI name cannot exceed 100 characters')
    }

    // Category validation
    if (!data.category || data.category.trim().length === 0) {
      errors.push('POI category is required')
    } else if (data.category.trim().length < 2) {
      errors.push('POI category must be at least 2 characters long')
    } else if (data.category.trim().length > 50) {
      errors.push('POI category cannot exceed 50 characters')
    }

    // Latitude validation
    if (data.lat === undefined || data.lat === null) {
      errors.push('Latitude is required')
    } else if (data.lat < -90 || data.lat > 90) {
      errors.push('Latitude must be between -90 and 90 degrees')
    }

    // Longitude validation
    if (data.long === undefined || data.long === null) {
      errors.push('Longitude is required')
    } else if (data.long < -180 || data.long > 180) {
      errors.push('Longitude must be between -180 and 180 degrees')
    }

    // South Africa bounds validation (optional business rule)
    if (data.lat && data.long) {
      const inSouthAfrica = this.isInSouthAfrica(data.lat, data.long)
      if (!inSouthAfrica) {
        errors.push('POI coordinates must be within South Africa')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate POI update data
   */
  validateUpdatePOI(data: UpdatePOIRequest): ValidationResult {
    const errors: string[] = []

    // ID validation
    if (!data.id || data.id.trim().length === 0) {
      errors.push('POI ID is required for updates')
    }

    // Run create validation for other fields
    const createValidation = this.validateCreatePOI(data)
    errors.push(...createValidation.errors)

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if coordinates are within South Africa bounds
   */
  private isInSouthAfrica(lat: number, lng: number): boolean {
    const southAfricaBounds = {
      north: -22.1265,
      south: -34.8191,
      east: 32.8950,
      west: 16.3449
    }

    return lat >= southAfricaBounds.south && 
           lat <= southAfricaBounds.north && 
           lng >= southAfricaBounds.west && 
           lng <= southAfricaBounds.east
  }

  /**
   * Sanitize POI data before sending to API
   */
  private sanitizePOIData<T extends CreatePOIRequest | UpdatePOIRequest>(data: T): T {
    return {
      ...data,
      name: data.name.trim(),
      category: data.category.trim(),
      lat: Number(data.lat),
      long: Number(data.long)
    }
  }

  /**
   * Create a new POI with validation
   */
  async createPOI(data: CreatePOIRequest): Promise<POIOperationResult<string>> {
    try {
      // Validate data
      const validation = this.validateCreatePOI(data)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          errorCode: 'VALIDATION_ERROR'
        }
      }

      // Sanitize data
      const sanitizedData = this.sanitizePOIData(data)

      // Call API
      const id = await poiApi.createPOI(sanitizedData)

      // Clear cache to force refresh
      this.clearCache()

      return {
        success: true,
        data: id
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to create POI'),
        errorCode: 'API_ERROR'
      }
    }
  }

  /**
   * Update an existing POI with validation
   */
  async updatePOI(data: UpdatePOIRequest): Promise<POIOperationResult<void>> {
    try {
      // Validate data
      const validation = this.validateUpdatePOI(data)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          errorCode: 'VALIDATION_ERROR'
        }
      }

      // Sanitize data
      const sanitizedData = this.sanitizePOIData(data)

      // Call API
      await poiApi.updatePOI(sanitizedData)

      // Update cache
      if (this.cache.has(data.id)) {
        const existingPOI = this.cache.get(data.id)!
        this.cache.set(data.id, { ...existingPOI, ...sanitizedData })
      }

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to update POI'),
        errorCode: 'API_ERROR'
      }
    }
  }

  /**
   * Delete a POI
   */
  async deletePOI(id: string): Promise<POIOperationResult<void>> {
    try {
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          error: 'POI ID is required',
          errorCode: 'VALIDATION_ERROR'
        }
      }

      // Call API
      await poiApi.deletePOI(id)

      // Remove from cache
      this.cache.delete(id)

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to delete POI'),
        errorCode: 'API_ERROR'
      }
    }
  }

  /**
   * Get all POIs with caching
   */
  async getAllPOIs(forceRefresh: boolean = false): Promise<POIOperationResult<POI[]>> {
    try {
      const now = Date.now()
      const cacheExpired = (now - this.lastFetchTime) > this.CACHE_DURATION

      if (!forceRefresh && !cacheExpired && this.cache.size > 0) {
        return {
          success: true,
          data: Array.from(this.cache.values())
        }
      }

      // Fetch from API
      const pois = await poiApi.getAllPOIs()

      // Update cache
      this.cache.clear()
      pois.forEach(poi => {
        this.cache.set(poi.id, poi)
      })
      this.lastFetchTime = now

      return {
        success: true,
        data: pois
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to load POIs'),
        errorCode: 'API_ERROR'
      }
    }
  }

  /**
   * Get POI by ID
   */
  async getPOIById(id: string): Promise<POIOperationResult<POI>> {
    try {
      if (!id || id.trim().length === 0) {
        return {
          success: false,
          error: 'POI ID is required',
          errorCode: 'VALIDATION_ERROR'
        }
      }

      // Check cache first
      if (this.cache.has(id)) {
        return {
          success: true,
          data: this.cache.get(id)!
        }
      }

      // Fetch from API
      const poi = await poiApi.getPOIById(id)

      // Update cache
      this.cache.set(id, poi)

      return {
        success: true,
        data: poi
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to load POI'),
        errorCode: 'API_ERROR'
      }
    }
  }

  /**
   * Filter POIs based on criteria
   */
  filterPOIs(pois: POI[], filters: POIFilters): POI[] {
    let filtered = [...pois]

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(poi => 
        poi.category.toLowerCase().includes(filters.category!.toLowerCase())
      )
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(poi => 
        poi.name.toLowerCase().includes(searchLower) ||
        poi.category.toLowerCase().includes(searchLower)
      )
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(poi => {
        const poiDate = new Date(poi.created_at)
        return poiDate >= filters.dateRange!.start && 
               poiDate <= filters.dateRange!.end
      })
    }

    // Coordinates filter (radius-based)
    if (filters.coordinates) {
      const { lat, lng, radius } = filters.coordinates
      filtered = filtered.filter(poi => {
        const distance = this.calculateDistance(lat, lng, poi.lat, poi.long)
        return distance <= radius
      })
    }

    return filtered
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Generate POI statistics
   */
  generateStats(pois: POI[]): POIStats {
    const categoryCounts: Record<string, number> = {}
    let totalLat = 0
    let totalLng = 0

    // Count categories and calculate average coordinates
    pois.forEach(poi => {
      categoryCounts[poi.category] = (categoryCounts[poi.category] || 0) + 1
      totalLat += poi.lat
      totalLng += poi.long
    })

    // Get recent POIs (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentPOIs = pois.filter(poi => 
      new Date(poi.created_at) >= thirtyDaysAgo
    ).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 10)

    return {
      totalPOIs: pois.length,
      categoryCounts,
      recentPOIs,
      averageCoordinates: pois.length > 0 ? {
        lat: totalLat / pois.length,
        lng: totalLng / pois.length
      } : undefined
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    this.lastFetchTime = 0
  }

  /**
   * Export POIs to CSV
   */
  async exportToCSV(): Promise<POIOperationResult<Blob>> {
    try {
      const blob = await poiApi.exportToCSV()
      return {
        success: true,
        data: blob
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to export POIs to CSV'),
        errorCode: 'API_ERROR'
      }
    }
  }

  /**
   * Export POIs to GeoJSON
   */
  async exportToGeoJSON(): Promise<POIOperationResult<Blob>> {
    try {
      const blob = await poiApi.exportToGeoJSON()
      return {
        success: true,
        data: blob
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to export POIs to GeoJSON'),
        errorCode: 'API_ERROR'
      }
    }
  }

  /**
   * Import POIs from CSV
   */
  async importFromCSV(file: File): Promise<POIOperationResult<void>> {
    try {
      // Basic file validation
      if (!file) {
        return {
          success: false,
          error: 'No file provided',
          errorCode: 'VALIDATION_ERROR'
        }
      }

      if (!file.name.toLowerCase().endsWith('.csv')) {
        return {
          success: false,
          error: 'File must be a CSV file',
          errorCode: 'VALIDATION_ERROR'
        }
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return {
          success: false,
          error: 'File size must be less than 10MB',
          errorCode: 'VALIDATION_ERROR'
        }
      }

      // Call API
      await poiApi.bulkCreateFromCSV(file)

      // Clear cache to force refresh
      this.clearCache()

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: formatError(error, 'Failed to import POIs from CSV'),
        errorCode: 'API_ERROR'
      }
    }
  }
}

// Export singleton instance
export const poiOperations = POIOperations.getInstance() 