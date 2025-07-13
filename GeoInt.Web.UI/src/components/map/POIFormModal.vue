<template>
  <div v-if="isVisible" class="poi-form-modal-overlay" @click="handleOverlayClick">
    <div class="poi-form-modal-content" @click.stop>
      <div class="poi-form-modal-header">
        <div class="poi-form-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
            <line x1="12" y1="7" x2="12" y2="13"/>
            <line x1="9" y1="10" x2="15" y2="10"/>
          </svg>
        </div>
        <h3 class="poi-form-modal-title">Add New POI</h3>
        <button class="poi-form-modal-close" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="poi-form-modal-body">
        <div class="poi-form-coordinates">
          <strong>Location:</strong> {{ coordinates[1].toFixed(4) }}°, {{ coordinates[0].toFixed(4) }}°
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="poi-form-field">
            <label for="poi-name" class="poi-form-label">POI Name</label>
            <input
              id="poi-name"
              v-model="formData.name"
              type="text"
              class="poi-form-input"
              placeholder="Enter POI name..."
              required
              ref="nameInput"
            />
          </div>
          
          <div class="poi-form-field">
            <label for="poi-category" class="poi-form-label">Category</label>
            <select
              id="poi-category"
              v-model="formData.category"
              class="poi-form-select"
              required
            >
              <option value="">Select a category</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="poi-form-actions">
            <button type="button" class="poi-form-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="poi-form-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add POI' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'

interface Props {
  isVisible: boolean
  coordinates: [number, number]
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: { name: string; category: string; coordinates: [number, number] }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const nameInput = ref<HTMLInputElement>()
const isSubmitting = ref(false)

const formData = reactive({
  name: '',
  category: ''
})

const categories = [
  'Restaurant',
  'Hospital',
  'School',
  'Park',
  'Shopping',
  'Gas Station',
  'Bank',
  'Hotel',
  'Library',
  'Police Station',
  'Fire Station',
  'Government Building',
  'Transport',
  'Business',
  'Entertainment'
]

const handleOverlayClick = () => {
  closeModal()
}

const closeModal = () => {
  formData.name = ''
  formData.category = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!formData.name.trim() || !formData.category) return
  
  isSubmitting.value = true
  
  try {
    emit('submit', {
      name: formData.name.trim(),
      category: formData.category,
      coordinates: props.coordinates
    })
    
    // Reset form
    formData.name = ''
    formData.category = ''
    
  } finally {
    isSubmitting.value = false
  }
}

// Focus name input when modal opens
onMounted(() => {
  if (props.isVisible) {
    nextTick(() => {
      nameInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.poi-form-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.poi-form-modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.poi-form-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.poi-form-modal-icon {
  width: 40px;
  height: 40px;
  background: #dbeafe;
  color: #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.poi-form-modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.poi-form-modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.poi-form-modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.poi-form-modal-body {
  padding: 20px 24px 24px 24px;
}

.poi-form-coordinates {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #475569;
  font-family: 'Monaco', 'Menlo', monospace;
}

.poi-form-field {
  margin-bottom: 20px;
}

.poi-form-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.poi-form-input,
.poi-form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.poi-form-input:focus,
.poi-form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.poi-form-input::placeholder {
  color: #9ca3af;
}

.poi-form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.poi-form-cancel {
  padding: 12px 24px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.poi-form-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.poi-form-submit {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.poi-form-submit:hover:not(:disabled) {
  background: #2563eb;
}

.poi-form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .poi-form-modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .poi-form-modal-header {
    padding: 20px 20px 16px 20px;
  }
  
  .poi-form-modal-body {
    padding: 16px 20px 20px 20px;
  }
  
  .poi-form-actions {
    flex-direction: column;
  }
  
  .poi-form-cancel,
  .poi-form-submit {
    width: 100%;
  }
}
</style> 