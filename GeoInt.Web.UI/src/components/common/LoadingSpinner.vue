<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" :class="spinnerClass"></div>
    <span v-if="text" class="ml-3 text-gray-600" :class="textClass">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  containerClass: 'p-4',
});

const spinnerClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-4 h-4';
    case 'large':
      return 'w-12 h-12';
    default:
      return 'w-8 h-8';
  }
});

const textClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-sm';
    case 'large':
      return 'text-lg';
    default:
      return 'text-base';
  }
});
</script> 