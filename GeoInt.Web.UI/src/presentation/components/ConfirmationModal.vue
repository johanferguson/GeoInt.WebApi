<template>
  <div class="modal">
    <div class="modal-overlay" @click="$emit('cancel')"></div>
    
    <div class="relative flex items-center justify-center min-h-screen p-4">
      <div class="modal-content w-full max-w-md">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component :is="iconComponent" :class="iconClasses" />
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">
              {{ title }}
            </h3>
          </div>
        </div>
        
        <!-- Content -->
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600">{{ message }}</p>
        </div>
        
        <!-- Actions -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            @click="$emit('cancel')"
            class="btn btn-secondary"
          >
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            :class="['btn', confirmClass]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/vue/24/outline';

interface Props {
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'question';
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
}

interface Emits {
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'warning',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmClass: 'btn-primary'
});

const emit = defineEmits<Emits>();

// Computed properties
const iconComponent = computed(() => {
  const icons = {
    warning: ExclamationTriangleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon,
    question: QuestionMarkCircleIcon
  };
  
  return icons[props.type];
});

const iconClasses = computed(() => {
  const classes = {
    warning: 'h-6 w-6 text-warning-600',
    error: 'h-6 w-6 text-error-600',
    info: 'h-6 w-6 text-primary-600',
    question: 'h-6 w-6 text-gray-600'
  };
  
  return classes[props.type];
});
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