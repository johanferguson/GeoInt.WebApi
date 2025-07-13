<template>
  <div class="popup-overlay" @click="$emit('close')">
    <div class="popup-content" @click.stop>
      <div class="popup-header">
        <h3>{{ poi.name }}</h3>
        <button @click="$emit('close')" class="close-button">×</button>
      </div>
      <div class="popup-body">
        <div class="detail-row">
          <span class="label">Category:</span>
          <span class="value">{{ poi.category }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Latitude:</span>
          <span class="value">{{ poi.lat.toFixed(6) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Longitude:</span>
          <span class="value">{{ poi.long.toFixed(6) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Created:</span>
          <span class="value">{{ formatDate(poi.created_at) }}</span>
        </div>
        <div v-if="poi.modified_at" class="detail-row">
          <span class="label">Modified:</span>
          <span class="value">{{ formatDate(poi.modified_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { POI } from '@/types/poi';

interface Props {
  poi: POI;
}

defineProps<Props>();
defineEmits<{
  close: [];
}>();

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.popup-overlay {
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

.popup-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 450px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid #e9ecef;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
}

.popup-header h3 {
  margin: 0;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
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

.popup-body {
  padding: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #495057;
  flex-shrink: 0;
}

.value {
  color: #6c757d;
  text-align: right;
  word-break: break-word;
}
</style> 