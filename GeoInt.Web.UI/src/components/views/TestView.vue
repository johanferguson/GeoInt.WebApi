<template>
  <div class="h-full p-6 bg-gray-100 overflow-y-auto">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">API Test Page</h2>
        
        <!-- Test Buttons -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            @click="testLoadPOIs"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <LoadingSpinner v-if="isLoading" size="small" class="mr-2" />
            Load All POIs
          </button>
          
          <button
            @click="testCreatePOI"
            :disabled="isCreating"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <LoadingSpinner v-if="isCreating" size="small" class="mr-2" />
            Create Test POI
          </button>
          
          <button
            @click="testUpdatePOI"
            :disabled="isUpdating || pois.length === 0"
            class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <LoadingSpinner v-if="isUpdating" size="small" class="mr-2" />
            Update First POI
          </button>
          
          <button
            @click="testDeletePOI"
            :disabled="isDeleting || pois.length === 0"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <LoadingSpinner v-if="isDeleting" size="small" class="mr-2" />
            Delete Last POI
          </button>
          
          <div class="flex items-center space-x-2">
            <input
              type="file"
              accept=".csv"
              @change="handleFileSelect"
              class="text-sm"
            />
            <button
              @click="testCSVImport"
              :disabled="isImporting || !selectedFile"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <LoadingSpinner v-if="isImporting" size="small" class="mr-2" />
              Import CSV
            </button>
          </div>
        </div>
        
        <!-- Statistics -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Statistics</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ totalPOIs }}</div>
              <div class="text-sm text-gray-500">Total POIs</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ categories.length }}</div>
              <div class="text-sm text-gray-500">Categories</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ isLoading ? 'Loading...' : 'Ready' }}</div>
              <div class="text-sm text-gray-500">Status</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ apiUrl }}</div>
              <div class="text-sm text-gray-500">API Port</div>
            </div>
          </div>
        </div>
        
        <!-- Categories -->
        <div v-if="categories.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Categories</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="category in categories"
              :key="category"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {{ category }}
            </span>
          </div>
        </div>
        
        <!-- POIs Table -->
        <div v-if="pois.length > 0">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">POIs Data ({{ pois.length }} items)</h3>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-300 px-4 py-2 text-left">ID</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Category</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Latitude</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Longitude</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="poi in pois.slice(0, 10)" :key="poi.id" class="hover:bg-gray-50">
                  <td class="border border-gray-300 px-4 py-2 text-sm font-mono">{{ poi.id.substring(0, 8) }}...</td>
                  <td class="border border-gray-300 px-4 py-2">{{ poi.name }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ poi.category }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ poi.lat.toFixed(6) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ poi.long.toFixed(6) }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ new Date(poi.created_at).toLocaleDateString() }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="pois.length > 10" class="text-sm text-gray-500 mt-2">
              Showing first 10 of {{ pois.length }} POIs
            </p>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!isLoading" class="text-center py-8">
          <div class="text-gray-400 text-lg mb-2">No POIs loaded</div>
          <div class="text-gray-500 text-sm">Click "Load All POIs" to fetch data from the API</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePOI } from '../../composables/usePOI';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const {
  pois,
  totalPOIs,
  categories,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  isImporting,
  loadPOIs,
  createPOI,
  updatePOI,
  deletePOI,
  importPOIsFromCSV,
} = usePOI();

const selectedFile = ref<File | null>(null);
const apiUrl = '5008';

const testLoadPOIs = async () => {
  await loadPOIs();
};

const testCreatePOI = async () => {
  const testPOI = {
    name: `Test POI ${Date.now()}`,
    category: 'Test',
    lat: -25.7479 + (Math.random() - 0.5) * 0.1,
    long: 28.2293 + (Math.random() - 0.5) * 0.1,
  };
  await createPOI(testPOI);
};

const testUpdatePOI = async () => {
  if (pois.length === 0) return;
  
  const firstPOI = pois[0];
  const updatedPOI = {
    id: firstPOI.id,
    name: `Updated ${firstPOI.name}`,
    category: firstPOI.category,
    lat: firstPOI.lat,
    long: firstPOI.long,
  };
  await updatePOI(updatedPOI);
};

const testDeletePOI = async () => {
  if (pois.length === 0) return;
  
  const lastPOI = pois[pois.length - 1];
  await deletePOI(lastPOI.id);
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files?.[0] || null;
};

const testCSVImport = async () => {
  if (!selectedFile.value) return;
  await importPOIsFromCSV(selectedFile.value);
  selectedFile.value = null;
};
</script> 