<template>
  <div v-if="isVisible" class="message-box-overlay" @click="handleOverlayClick">
    <div class="message-box" @click.stop>
      <div class="message-header" :class="typeClass">
        <div class="message-icon">
          <svg v-if="type === 'confirmation'" class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else-if="type === 'error'" class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg v-else-if="type === 'warning'" class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg v-else-if="type === 'success'" class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-6h-2V7h2v4z"/>
          </svg>
        </div>
        <h3 class="message-title">{{ title }}</h3>
      </div>
      
      <div class="message-body">
        <p class="message-text">{{ message }}</p>
      </div>
      
      <div class="message-actions">
        <button 
          v-if="showCancel" 
          @click="handleCancel"
          class="btn btn-secondary"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm"
          class="btn"
          :class="confirmButtonClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  type?: 'confirmation' | 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  confirmButtonType?: 'primary' | 'danger' | 'success' | 'warning';
  closeOnOverlayClick?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  confirmButtonType: 'primary',
  closeOnOverlayClick: true
});

const emits = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
}>();

const isVisible = ref(false);

// Computed properties
const typeClass = computed(() => `message-${props.type}`);

const confirmButtonClass = computed(() => {
  switch (props.confirmButtonType) {
    case 'danger': return 'btn-danger';
    case 'success': return 'btn-success';
    case 'warning': return 'btn-warning';
    default: return 'btn-primary';
  }
});

// Methods
function show() {
  isVisible.value = true;
}

function hide() {
  isVisible.value = false;
}

function handleConfirm() {
  emits('confirm');
  hide();
}

function handleCancel() {
  emits('cancel');
  hide();
}

function handleOverlayClick() {
  if (props.closeOnOverlayClick) {
    emits('close');
    hide();
  }
}

// Expose methods for parent component
defineExpose({
  show,
  hide
});
</script>

<style scoped>
.message-box-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.message-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.message-confirmation {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.message-error {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.message-warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.message-success {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
}

.message-info {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
}

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.icon {
  width: 20px;
  height: 20px;
}

.message-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.message-body {
  padding: 1.5rem;
}

.message-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #495057;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Responsive Design */
@media (max-width: 768px) {
  .message-box {
    width: 95%;
    margin: 1rem;
  }
  
  .message-header {
    padding: 1rem;
  }
  
  .message-body {
    padding: 1rem;
  }
  
  .message-actions {
    padding: 0.75rem 1rem 1rem;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .btn:last-child {
    margin-bottom: 0;
  }
}
</style> 