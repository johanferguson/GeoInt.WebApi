<template>
  <div class="poi-table-container">
    <div class="table-header">
      <div class="header-content">
        <svg class="header-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <h2>Point of Interest Management</h2>
      </div>
      <div class="actions">
        <button @click="showAddForm = true" class="btn btn-primary">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add New POI
        </button>
        <CSVImport @imported="loadPOIs" />
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>Loading POIs...</span>
      </div>
      
      <div v-else-if="error" class="error">
        <p>Error: {{ error }}</p>
        <button @click="loadPOIs" class="btn btn-secondary">Retry</button>
      </div>
      
      <div v-else-if="pois.length === 0" class="empty-state">
        <p>No POIs found</p>
        <button @click="showAddForm = true" class="btn btn-primary">
          Add First POI
        </button>
      </div>
      
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th 
                @click="sortBy('name')"
                :class="{ 'sortable': true, 'sorted': sortColumn === 'name' }"
              >
                Name
                <span class="sort-indicator" :class="getSortIndicatorClass('name')">
                  <svg class="sort-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </span>
              </th>
              <th 
                @click="sortBy('category')"
                :class="{ 'sortable': true, 'sorted': sortColumn === 'category' }"
              >
                Category
                <span class="sort-indicator" :class="getSortIndicatorClass('category')">
                  <svg class="sort-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </span>
              </th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="poi in sortedPois" :key="poi.id">
              <td>{{ poi.name }}</td>
              <td>{{ poi.category }}</td>
              <td>{{ poi.lat.toFixed(6) }}</td>
              <td>{{ poi.long.toFixed(6) }}</td>
              <td>{{ formatDate(poi.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="editPOI(poi)"
                    class="btn btn-secondary"
                  >
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Edit
                  </button>
                  <button 
                    @click="deletePOI(poi.id)"
                    class="btn btn-danger"
                  >
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <POIForm 
      v-if="showAddForm || editingPOI"
      :poi="editingPOI"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { poiApi } from '@/services/api';
import { POI } from '@/types/poi';
import POIForm from './POIForm.vue';
import CSVImport from './CSVImport.vue';

const pois = ref<POI[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showAddForm = ref(false);
const editingPOI = ref<POI | null>(null);

// Sorting state
const sortColumn = ref<'name' | 'category' | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');

// Computed property for sorted POIs
const sortedPois = computed(() => {
  if (!sortColumn.value) return pois.value;
  
  return [...pois.value].sort((a, b) => {
    let aValue = a[sortColumn.value!];
    let bValue = b[sortColumn.value!];
    
    // Convert to lowercase for case-insensitive sorting
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Sorting functions
function sortBy(column: 'name' | 'category') {
  if (sortColumn.value === column) {
    // If already sorting by this column, toggle direction
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new column and default to ascending
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

function getSortIndicatorClass(column: 'name' | 'category') {
  if (sortColumn.value !== column) return '';
  
  return sortDirection.value === 'asc' ? 'sort-asc' : 'sort-desc';
}

onMounted(() => {
  loadPOIs();
});

async function loadPOIs() {
  loading.value = true;
  error.value = null;
  
  try {
    pois.value = await poiApi.getAllPOIs();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load POIs';
  } finally {
    loading.value = false;
  }
}

function editPOI(poi: POI) {
  editingPOI.value = poi;
}

async function deletePOI(id: string) {
  if (!confirm('Are you sure you want to delete this POI?')) return;
  
  try {
    await poiApi.deletePOI(id);
    await loadPOIs();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete POI';
  }
}

function handleSave() {
  showAddForm.value = false;
  editingPOI.value = null;
  loadPOIs();
}

function handleCancel() {
  showAddForm.value = false;
  editingPOI.value = null;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.poi-table-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #2c3e50;
}

.table-header h2 {
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
  font-size: 1.75rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.loading, .error, .empty-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error {
  color: #dc3545;
}

.empty-state {
  color: #6c757d;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table th {
  background: #2c3e50;
  padding: 1.25rem;
  text-align: left;
  font-weight: 700;
  color: white;
  border-bottom: 2px solid #34495e;
  white-space: nowrap;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  position: relative;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.table th.sortable:hover {
  background: #34495e;
}

.table th.sorted {
  background: #34495e;
}

.table td {
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons .btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.sort-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  opacity: 0.4;
  transition: all 0.2s ease;
}

.table th.sortable:hover .sort-indicator {
  opacity: 0.8;
}

.table th.sorted .sort-indicator {
  opacity: 1;
}

.sort-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.sort-asc .sort-icon {
  transform: rotate(180deg);
}

.sort-desc .sort-icon {
  transform: rotate(0deg);
}

@media (max-width: 768px) {
  .poi-table-container {
    padding: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style> 