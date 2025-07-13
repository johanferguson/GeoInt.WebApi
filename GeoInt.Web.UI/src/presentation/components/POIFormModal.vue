<template>
  <div class="modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    
    <div class="relative flex items-center justify-center min-h-screen p-4">
      <div class="modal-content w-full max-w-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Edit POI' : 'Create New POI' }}
          </h3>
        </div>
        
        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
          <!-- Name Field -->
          <div>
            <label class="form-label" for="name">Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Enter POI name"
              :class="{ 'border-error-500': errors.name }"
              required
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
          </div>
          
          <!-- Category Field -->
          <div>
            <label class="form-label" for="category">Category</label>
            <select
              id="category"
              v-model="formData.category"
              class="form-input"
              :class="{ 'border-error-500': errors.category }"
              required
            >
              <option value="">Select a category</option>
              <option v-for="category in predefinedCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <p v-if="errors.category" class="form-error">{{ errors.category }}</p>
          </div>
          
          <!-- Coordinates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label" for="lat">Latitude</label>
              <input
                id="lat"
                v-model.number="formData.lat"
                type="number"
                step="any"
                class="form-input"
                placeholder="e.g., 40.7128"
                :class="{ 'border-error-500': errors.lat }"
                required
              />
              <p v-if="errors.lat" class="form-error">{{ errors.lat }}</p>
            </div>
            
            <div>
              <label class="form-label" for="long">Longitude</label>
              <input
                id="long"
                v-model.number="formData.long"
                type="number"
                step="any"
                class="form-input"
                placeholder="e.g., -74.0060"
                :class="{ 'border-error-500': errors.long }"
                required
              />
              <p v-if="errors.long" class="form-error">{{ errors.long }}</p>
            </div>
          </div>
          
          <!-- Coordinate Helper -->
          <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>Tip:</strong> Latitude should be between -90 and 90. Longitude should be between -180 and 180.</p>
            <p>Example: New York City is approximately 40.7128, -74.0060</p>
          </div>
          
          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <div v-if="isSubmitting" class="spinner mr-2"></div>
              {{ isEditing ? 'Update POI' : 'Create POI' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { POIModel, POICreateRequest, POIUpdateRequest } from '@/models/POI';
import { ValidationService } from '../../infrastructure/services/ValidationService';

interface Props {
  isEditing: boolean;
  poi?: POIModel;
}

interface Emits {
  (e: 'close'): void;
  (e: 'submit', data: POICreateRequest | POIUpdateRequest): void;
}

const props = withDefaults(defineProps<Props>(), {
  poi: undefined
});

const emit = defineEmits<Emits>();

// Form data
const formData = reactive({
  name: '',
  category: '',
  lat: 0,
  long: 0
});

// State
const errors = reactive({
  name: '',
  category: '',
  lat: '',
  long: ''
});

const isSubmitting = ref(false);

// Predefined categories
const predefinedCategories = [
  'Restaurant',
  'Hotel',
  'Shop',
  'Park',
  'Museum',
  'Hospital',
  'School',
  'Gas Station',
  'Bank',
  'Pharmacy',
  'Tourist Attraction',
  'Entertainment',
  'Transportation',
  'Government',
  'Religious',
  'Sports',
  'Other'
];

// Initialize form data
const initializeForm = () => {
  if (props.isEditing && props.poi) {
    formData.name = props.poi.name;
    formData.category = props.poi.category;
    formData.lat = props.poi.lat;
    formData.long = props.poi.long;
  } else {
    formData.name = '';
    formData.category = '';
    formData.lat = 0;
    formData.long = 0;
  }
  
  // Clear errors
  clearErrors();
};

// Clear errors
const clearErrors = () => {
  errors.name = '';
  errors.category = '';
  errors.lat = '';
  errors.long = '';
};

// Validate form
const validateForm = (): boolean => {
  clearErrors();
  
  const validator = new ValidationService();
  let isValid = true;
  
  // Name validation
  const nameValidation = validator.validateRequired(formData.name, 'Name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.errors[0];
    isValid = false;
  }
  
  // Category validation
  const categoryValidation = validator.validateRequired(formData.category, 'Category');
  if (!categoryValidation.isValid) {
    errors.category = categoryValidation.errors[0];
    isValid = false;
  }
  
  // Coordinates validation
  const coordinatesValidation = validator.validateCoordinates(formData.lat, formData.long);
  if (!coordinatesValidation.isValid) {
    coordinatesValidation.errors.forEach(error => {
      if (error.includes('Latitude')) {
        errors.lat = error;
      } else if (error.includes('Longitude')) {
        errors.long = error;
      }
    });
    isValid = false;
  }
  
  return isValid;
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    if (props.isEditing && props.poi) {
      const updateData: POIUpdateRequest = {
        id: props.poi.id,
        name: formData.name,
        category: formData.category,
        lat: formData.lat,
        long: formData.long
      };
      emit('submit', updateData);
    } else {
      const createData: POICreateRequest = {
        name: formData.name,
        category: formData.category,
        lat: formData.lat,
        long: formData.long
      };
      emit('submit', createData);
    }
  } catch (error) {
    console.error('Form submission error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for prop changes
watch(() => props.poi, initializeForm, { immediate: true });

// Initialize form on mount
initializeForm();
</script>

<style scoped>
.modal {
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 