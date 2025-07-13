<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <TransitionGroup name="slide-up">
      <div
        v-for="message in messages"
        :key="message.id"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden"
        :class="getMessageClasses(message.type)"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="getMessageIcon(message.type)" class="h-5 w-5" />
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium">{{ message.title }}</p>
              <p v-if="message.content" class="mt-1 text-sm opacity-90">{{ message.content }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeMessage(message.id)"
                class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline';
import { useMessageStore } from '@/stores/messageStore';
import { MessageType } from '@/types/common';

const messageStore = useMessageStore();

const messages = computed(() => messageStore.messages);

const removeMessage = (id: string) => {
  messageStore.removeMessage(id);
};

const getMessageClasses = (type: MessageType) => {
  const classes = {
    success: 'border-l-4 border-success-500',
    error: 'border-l-4 border-error-500',
    warning: 'border-l-4 border-warning-500',
    info: 'border-l-4 border-primary-500'
  };
  
  return classes[type] || classes.info;
};

const getMessageIcon = (type: MessageType) => {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  
  return icons[type] || icons.info;
};
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-move {
  transition: transform 0.3s ease;
}
</style> 