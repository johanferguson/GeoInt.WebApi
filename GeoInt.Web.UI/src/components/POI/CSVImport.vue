<template>
  <div class="csv-import">
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      @change="handleFileSelect"
      class="file-input"
    />
    
    <button @click="triggerFileInput" class="btn btn-secondary">
      <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
      Import CSV
    </button>
    
    <div v-if="importing" class="import-status">
      <div class="spinner"></div>
      <span>Importing...</span>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="success" class="success-message">
      Successfully imported {{ importedCount }} POIs
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { poiApi } from '@/services/api';

const emits = defineEmits<{
  imported: [];
}>();

const fileInput = ref<HTMLInputElement>();
const importing = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const importedCount = ref(0);

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  if (!file.name.endsWith('.csv')) {
    error.value = 'Please select a CSV file';
    return;
  }
  
  importing.value = true;
  error.value = null;
  success.value = false;
  
  try {
    await poiApi.bulkCreateFromCSV(file);
    
    success.value = true;
    importedCount.value = await estimateImportedCount(file);
    
    setTimeout(() => {
      success.value = false;
    }, 5000);
    
    emits('imported');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to import CSV';
  } finally {
    importing.value = false;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

async function estimateImportedCount(file: File): Promise<number> {
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    return Math.max(0, lines.length - 1); // Subtract header row
  } catch {
    return 0;
  }
}
</script>

<style scoped>
.csv-import {
  position: relative;
  display: inline-block;
}

.file-input {
  display: none;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.import-status {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #1565c0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
}

.error-message {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #c62828;
  z-index: 100;
}

.success-message {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #e8f5e8;
  border: 1px solid #c8e6c9;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #2e7d32;
  z-index: 100;
}

.spinner {
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 