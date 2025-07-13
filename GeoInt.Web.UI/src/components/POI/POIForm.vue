<template>
  <div class="form-overlay" @click="$emit('cancel')">
    <div class="form-container" @click.stop>
      <div class="form-header">
        <h3>{{ isEditing ? 'Edit POI' : 'Add New POI' }}</h3>
        <button @click="$emit('cancel')" class="close-button">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="form-body">
        <div class="form-group">
          <label for="name" class="form-label">Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            required
            placeholder="Enter POI name"
          />
        </div>
        
        <div class="form-group">
          <label for="category" class="form-label">Category *</label>
          <input
            id="category"
            v-model="formData.category"
            type="text"
            class="form-control"
            required
            placeholder="Enter category"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="lat" class="form-label">Latitude *</label>
            <input
              id="lat"
              v-model.number="formData.lat"
              type="number"
              step="any"
              class="form-control"
              required
              placeholder="e.g., -26.2041"
            />
          </div>
          
          <div class="form-group">
            <label for="long" class="form-label">Longitude *</label>
            <input
              id="long"
              v-model.number="formData.long"
              type="number"
              step="any"
              class="form-control"
              required
              placeholder="e.g., 28.0473"
            />
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Saving...' : isEditing ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { poiApi } from '@/services/api';
import { POI, CreatePOIRequest, UpdatePOIRequest } from '@/types/poi';

interface Props {
  poi?: POI | null;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  save: [];
  cancel: [];
}>();

const saving = ref(false);
const error = ref<string | null>(null);

const formData = reactive<CreatePOIRequest>({
  name: '',
  category: '',
  lat: 0,
  long: 0
});

const isEditing = computed(() => !!props.poi);

onMounted(() => {
  if (props.poi) {
    formData.name = props.poi.name;
    formData.category = props.poi.category;
    formData.lat = props.poi.lat;
    formData.long = props.poi.long;
  }
});

async function handleSubmit() {
  saving.value = true;
  error.value = null;
  
  try {
    if (isEditing.value && props.poi) {
      const updateData: UpdatePOIRequest = {
        id: props.poi.id,
        ...formData
      };
      await poiApi.updatePOI(updateData);
    } else {
      await poiApi.createPOI(formData);
    }
    
    emits('save');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save POI';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.form-header h3 {
  margin: 0;
  color: white;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.form-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #2c3e50;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-control {
  width: 100%;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.form-control:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
  background: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.error-message {
  padding: 1rem 1.5rem;
  background: #f8d7da;
  color: #721c24;
  border-top: 1px solid #f1aeb5;
  margin-top: 1rem;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style> 