<template>
  <div class="add-poi-button-container">
    <button
      class="add-poi-button"
      :class="{ 'active': isAddMode }"
      @click="toggleAddMode"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
        <line x1="12" y1="7" x2="12" y2="13"/>
        <line x1="9" y1="10" x2="15" y2="10"/>
      </svg>
      <span>{{ isAddMode ? 'Cancel' : 'Add POI' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isAddMode: boolean
}

interface Emits {
  (e: 'toggle-add-mode'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleAddMode = () => {
  emit('toggle-add-mode')
}
</script>

<style scoped>
.add-poi-button-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.add-poi-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.add-poi-button:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.add-poi-button.active {
  background: rgba(239, 68, 68, 0.95);
  border-color: #ef4444;
  color: white;
  box-shadow: 0 6px 25px rgba(239, 68, 68, 0.3);
}

.add-poi-button.active:hover {
  background: rgba(220, 38, 38, 0.95);
  border-color: #dc2626;
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .add-poi-button-container {
    top: 10px;
    right: 10px;
  }
  
  .add-poi-button {
    padding: 10px 16px;
    font-size: 17px;
  }
}
</style> 