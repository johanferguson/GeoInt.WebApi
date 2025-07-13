import { POICreateRequest, POIUpdateRequest, POIBulkCreateRequest } from '@/models/POI';
import { ValidationResult } from '@/types/common';
import { IValidationService } from '@/business/services/IValidationService';

export class ValidationService implements IValidationService {
  
  validatePOICreate(request: POICreateRequest): ValidationResult {
    const errors: string[] = [];
    
    // Name validation
    const nameValidation = this.validateRequired(request.name, 'Name');
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    }
    
    // Category validation
    const categoryValidation = this.validateRequired(request.category, 'Category');
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    }
    
    // Coordinates validation
    const coordinatesValidation = this.validateCoordinates(request.lat, request.long);
    if (!coordinatesValidation.isValid) {
      errors.push(...coordinatesValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validatePOIUpdate(request: POIUpdateRequest): ValidationResult {
    const errors: string[] = [];
    
    // ID validation
    if (!request.id || request.id.trim() === '') {
      errors.push('ID is required');
    }
    
    // Name validation
    const nameValidation = this.validateRequired(request.name, 'Name');
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    }
    
    // Category validation
    const categoryValidation = this.validateRequired(request.category, 'Category');
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    }
    
    // Coordinates validation
    const coordinatesValidation = this.validateCoordinates(request.lat, request.long);
    if (!coordinatesValidation.isValid) {
      errors.push(...coordinatesValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validatePOIBulkCreate(request: POIBulkCreateRequest): ValidationResult {
    const errors: string[] = [];
    
    if (!request.pois || request.pois.length === 0) {
      errors.push('At least one POI is required');
      return { isValid: false, errors };
    }
    
    if (request.pois.length > 1000) {
      errors.push('Maximum 1000 POIs can be imported at once');
    }
    
    // Validate each POI
    request.pois.forEach((poi, index) => {
      const validation = this.validatePOICreate(poi);
      if (!validation.isValid) {
        errors.push(`Row ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateCoordinates(lat: number, long: number): ValidationResult {
    const errors: string[] = [];
    
    if (isNaN(lat) || isNaN(long)) {
      errors.push('Coordinates must be valid numbers');
    } else {
      if (lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
      
      if (long < -180 || long > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateRequired(value: string, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (!value || value.trim() === '') {
      errors.push(`${fieldName} is required`);
    } else if (value.length > 255) {
      errors.push(`${fieldName} must be less than 255 characters`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateCSVFile(file: File): ValidationResult {
    const errors: string[] = [];
    
    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }
    
    // Check file type
    const allowedTypes = ['text/csv', 'application/csv'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      errors.push('Only CSV files are allowed');
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    // Check if file is empty
    if (file.size === 0) {
      errors.push('File cannot be empty');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateNumericRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (isNaN(value)) {
      errors.push(`${fieldName} must be a valid number`);
    } else if (value < min || value > max) {
      errors.push(`${fieldName} must be between ${min} and ${max}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 