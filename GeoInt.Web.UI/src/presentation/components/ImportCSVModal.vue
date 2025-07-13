<template>
  <div class="modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    
    <div class="relative flex items-center justify-center min-h-screen p-4">
      <div class="modal-content w-full max-w-4xl">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Import POIs from CSV</h3>
        </div>
        
        <!-- Content -->
        <div class="px-6 py-4">
          <!-- Step 1: File Upload -->
          <div v-if="step === 1">
            <h4 class="text-md font-medium text-gray-900 mb-4">Step 1: Upload CSV File</h4>
            
            <!-- CSV Format Info -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h5 class="font-medium text-blue-900 mb-2">CSV Format Requirements</h5>
              <p class="text-sm text-blue-800 mb-3">Your CSV file should have the following columns:</p>
              <div class="bg-blue-100 rounded p-3 text-sm font-mono text-blue-900">
                name,category,lat,long
              </div>
              <p class="text-sm text-blue-800 mt-3">
                <strong>Example:</strong> "Central Park,Park,40.785091,-73.968285"
              </p>
            </div>
            
            <!-- File Upload -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                ref="fileInput"
                type="file"
                accept=".csv"
                @change="handleFileSelect"
                class="hidden"
              />
              
              <div v-if="!selectedFile">
                <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
                <p class="mt-2 text-sm text-gray-600">
                  <button
                    @click="$refs.fileInput.click()"
                    class="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Click to upload
                  </button>
                  or drag and drop
                </p>
                <p class="text-xs text-gray-500 mt-1">CSV files up to 10MB</p>
              </div>
              
              <div v-else class="space-y-2">
                <DocumentIcon class="mx-auto h-12 w-12 text-green-500" />
                <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                <button
                  @click="clearFile"
                  class="text-sm text-error-600 hover:text-error-800"
                >
                  Remove file
                </button>
              </div>
            </div>
            
            <!-- Validation Errors -->
            <div v-if="validationErrors.length > 0" class="mt-4 bg-error-50 border border-error-200 rounded-lg p-4">
              <h5 class="font-medium text-error-900 mb-2">Validation Errors</h5>
              <ul class="text-sm text-error-800 space-y-1">
                <li v-for="error in validationErrors" :key="error" class="flex items-start">
                  <span class="text-error-500 mr-2">•</span>
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Step 2: Preview -->
          <div v-if="step === 2" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-md font-medium text-gray-900">Step 2: Preview Data</h4>
              <span class="text-sm text-gray-500">{{ parsedData.length }} POIs to import</span>
            </div>
            
            <!-- Preview Table -->
            <div class="max-h-96 overflow-auto border rounded-lg">
              <table class="table">
                <thead class="table-header">
                  <tr>
                    <th class="table-header-cell">Name</th>
                    <th class="table-header-cell">Category</th>
                    <th class="table-header-cell">Latitude</th>
                    <th class="table-header-cell">Longitude</th>
                    <th class="table-header-cell">Status</th>
                  </tr>
                </thead>
                <tbody class="table-body">
                  <tr v-for="(item, index) in parsedData.slice(0, 50)" :key="index" class="table-row">
                    <td class="table-cell">{{ item.name }}</td>
                    <td class="table-cell">{{ item.category }}</td>
                    <td class="table-cell">{{ item.lat }}</td>
                    <td class="table-cell">{{ item.long }}</td>
                    <td class="table-cell">
                      <span 
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          item.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        ]"
                      >
                        {{ item.valid ? 'Valid' : 'Invalid' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Show more indicator -->
            <div v-if="parsedData.length > 50" class="text-center text-sm text-gray-500 py-2">
              Showing first 50 rows of {{ parsedData.length }} total rows
            </div>
            
            <!-- Import Summary -->
            <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ validRows }}</div>
                <div class="text-sm text-gray-600">Valid POIs</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">{{ invalidRows }}</div>
                <div class="text-sm text-gray-600">Invalid POIs</div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-between pt-6">
            <button
              v-if="step === 2"
              @click="step = 1"
              class="btn btn-secondary"
            >
              <ArrowLeftIcon class="w-4 h-4 mr-1" />
              Back
            </button>
            <div v-else></div>
            
            <div class="flex space-x-3">
              <button
                @click="$emit('close')"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              
              <button
                v-if="step === 1"
                @click="parseCSV"
                :disabled="!selectedFile || isProcessing"
                class="btn btn-primary"
              >
                <div v-if="isProcessing" class="spinner mr-2"></div>
                Preview Data
              </button>
              
              <button
                v-if="step === 2"
                @click="importData"
                :disabled="validRows === 0 || isImporting"
                class="btn btn-success"
              >
                <div v-if="isImporting" class="spinner mr-2"></div>
                Import {{ validRows }} POIs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DocumentIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';
import Papa from 'papaparse';
import { ValidationService } from '../../infrastructure/services/ValidationService';

interface Emits {
  (e: 'close'): void;
  (e: 'import', data: any[]): void;
}

const emit = defineEmits<Emits>();

// State
const step = ref(1);
const selectedFile = ref<File | null>(null);
const parsedData = ref<any[]>([]);
const validationErrors = ref<string[]>([]);
const isProcessing = ref(false);
const isImporting = ref(false);

// File input ref
const fileInput = ref<HTMLInputElement | null>(null);

// Computed
const validRows = computed(() => 
  parsedData.value.filter(item => item.valid).length
);

const invalidRows = computed(() => 
  parsedData.value.filter(item => !item.valid).length
);

// Methods
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    validationErrors.value = [];
    
    // Validate file
    const validator = new ValidationService();
    const validation = validator.validateCSVFile(file);
    
    if (!validation.isValid) {
      validationErrors.value = validation.errors;
      return;
    }
    
    selectedFile.value = file;
  }
};

const clearFile = () => {
  selectedFile.value = null;
  parsedData.value = [];
  validationErrors.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const parseCSV = async () => {
  if (!selectedFile.value) return;
  
  isProcessing.value = true;
  validationErrors.value = [];
  
  try {
    Papa.parse(selectedFile.value, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validator = new ValidationService();
        
        // Validate required columns
        const requiredColumns = ['name', 'category', 'lat', 'long'];
        const headers = results.meta.fields || [];
        const missingColumns = requiredColumns.filter(col => 
          !headers.some(header => header.toLowerCase() === col)
        );
        
        if (missingColumns.length > 0) {
          validationErrors.value = [
            `Missing required columns: ${missingColumns.join(', ')}`
          ];
          isProcessing.value = false;
          return;
        }
        
        // Process and validate data
        parsedData.value = results.data.map((row: any, index: number) => {
          const normalizedRow = {
            name: row.name || row.Name || '',
            category: row.category || row.Category || '',
            lat: parseFloat(row.lat || row.Lat || row.latitude || row.Latitude || '0'),
            long: parseFloat(row.long || row.Long || row.longitude || row.Longitude || '0')
          };
          
          // Validate each row
          const validation = validator.validatePOICreate(normalizedRow);
          
          return {
            ...normalizedRow,
            valid: validation.isValid,
            errors: validation.errors,
            rowNumber: index + 1
          };
        });
        
        step.value = 2;
      },
      error: (error) => {
        validationErrors.value = [`Failed to parse CSV: ${error.message}`];
      }
    });
  } catch (error) {
    validationErrors.value = [`Unexpected error: ${error}`];
  } finally {
    isProcessing.value = false;
  }
};

const importData = async () => {
  const validData = parsedData.value.filter(item => item.valid);
  
  if (validData.length === 0) {
    return;
  }
  
  isImporting.value = true;
  
  try {
    // Transform data to match API format
    const importData = validData.map(item => ({
      name: item.name,
      category: item.category,
      lat: item.lat,
      long: item.long
    }));
    
    emit('import', importData);
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    isImporting.value = false;
  }
};
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