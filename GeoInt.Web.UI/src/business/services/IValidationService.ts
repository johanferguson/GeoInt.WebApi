import { POICreateRequest, POIUpdateRequest, POIBulkCreateRequest } from '@/models/POI';
import { ValidationResult } from '@/types/common';

export interface IValidationService {
  validatePOICreate(request: POICreateRequest): ValidationResult;
  validatePOIUpdate(request: POIUpdateRequest): ValidationResult;
  validatePOIBulkCreate(request: POIBulkCreateRequest): ValidationResult;
  validateCoordinates(lat: number, long: number): ValidationResult;
  validateRequired(value: string, fieldName: string): ValidationResult;
  validateCSVFile(file: File): ValidationResult;
} 