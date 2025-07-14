<template>
  <tr :class="[isSelected ? 'bg-geoint-50' : 'bg-white', 'hover:bg-gray-50', 'transition-colors', 'duration-200']">
    <!-- Checkbox Column -->
    <td class="px-8 py-6 whitespace-nowrap">
      <input
        v-if="!isAdding"
        type="checkbox"
        :checked="isSelected"
        @change="handleSelect"
        class="h-5 w-5 text-geoint-600 focus:ring-geoint-500 border-gray-300 rounded transition-all duration-200"
      />
    </td>

    <!-- Name Column -->
    <td class="px-8 py-6 whitespace-nowrap">
      <div v-if="!isEditing && !isAdding" class="text-xl font-bold text-gray-900">
        {{ poi?.name }}
      </div>
      <div v-else>
        <input
          v-model="editForm.name"
          type="text"
          ref="nameInput"
          placeholder="Enter POI name"
          class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-geoint-500 focus:border-geoint-500 transition-all duration-200"
          :class="{ 'border-red-300': validationErrors.name }"
        />
        <p v-if="validationErrors.name" class="mt-2 text-base text-red-600 font-medium">
          {{ validationErrors.name }}
        </p>
      </div>
    </td>

    <!-- Category Column -->
    <td class="px-8 py-6 whitespace-nowrap">
      <div v-if="!isEditing && !isAdding" class="text-lg text-gray-900">
        <span 
          class="inline-flex items-center px-4 py-2 rounded-full text-base font-bold text-white category-badge shadow-md"
          :style="{ backgroundColor: getCategoryColor(poi?.category) }"
        >
          {{ poi?.category }}
        </span>
      </div>
      <div v-else>
        <select
          v-model="editForm.category"
          class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-geoint-500 focus:border-geoint-500 transition-all duration-200"
          :class="{ 'border-red-300': validationErrors.category }"
        >
          <option value="">Select category</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <p v-if="validationErrors.category" class="mt-2 text-base text-red-600 font-medium">
          {{ validationErrors.category }}
        </p>
      </div>
    </td>

    <!-- Created Date Column -->
    <td class="px-8 py-6 whitespace-nowrap">
      <div v-if="!isAdding" class="text-lg font-semibold text-gray-900">
        {{ formatDate(poi?.created_at) }}
      </div>
      <div v-else class="space-y-3">
        <input
          v-model.number="editForm.lat"
          type="number"
          step="0.000001"
          min="-90"
          max="90"
          placeholder="Latitude"
          class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-geoint-500 focus:border-geoint-500 transition-all duration-200"
          :class="{ 'border-red-300': validationErrors.lat }"
        />
        <input
          v-model.number="editForm.long"
          type="number"
          step="0.000001"
          min="-180"
          max="180"
          placeholder="Longitude"
          class="block w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-geoint-500 focus:border-geoint-500 transition-all duration-200"
          :class="{ 'border-red-300': validationErrors.long }"
        />
        <p v-if="validationErrors.lat" class="text-base text-red-600 font-medium">
          {{ validationErrors.lat }}
        </p>
        <p v-if="validationErrors.long" class="text-base text-red-600 font-medium">
          {{ validationErrors.long }}
        </p>
      </div>
    </td>

    <!-- Actions Column -->
    <td class="px-8 py-6 whitespace-nowrap text-right text-lg font-semibold">
      <div v-if="isEditing || isAdding" class="flex justify-end space-x-3">
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="inline-flex items-center px-6 py-3 border border-transparent text-lg font-bold rounded-lg text-white bg-geoint-600 hover:bg-geoint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50 transition-all duration-200 shadow-md"
        >
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Save
        </button>
        <button
          @click="handleCancel"
          class="inline-flex items-center px-6 py-3 border border-gray-300 text-lg font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 transition-all duration-200 shadow-md"
        >
          Cancel
        </button>
      </div>
      <div v-else class="flex justify-end space-x-4">
        <button
          @click="startEditing"
          class="text-geoint-600 hover:text-geoint-900 font-bold text-lg px-3 py-2 rounded-lg hover:bg-geoint-50 transition-all duration-200"
        >
          Edit
        </button>
        <button
          @click="handleDelete"
          class="text-red-600 hover:text-red-900 font-bold text-lg px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { POI } from '../../entities/POI'

interface Props {
  poi?: POI
  isSelected?: boolean
  isAdding?: boolean
  categoryColors?: Record<string, string>
}

interface Emits {
  (e: 'select', poiId: string): void
  (e: 'edit', poi: POI): void
  (e: 'delete', poi: POI): void
  (e: 'save', poi: POI): void
  (e: 'cancel'): void
  (e: 'add-save', poiData: Omit<POI, 'id' | 'created_at' | 'modified_at' | 'deleted_at'>): void
  (e: 'add-cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isAdding: false,
  categoryColors: () => ({})
})

const emit = defineEmits<Emits>()

// Local state
const isEditing = ref(false)
const isSaving = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const editForm = ref({
  name: '',
  category: '',
  lat: 0,
  long: 0
})

const validationErrors = ref({
  name: '',
  category: '',
  lat: '',
  long: ''
})

// Category options
const categories = [
  'Restaurant',
  'Hotel',
  'Shopping',
  'Entertainment',
  'Transportation',
  'Healthcare',
  'Education',
  'Government',
  'Other'
]

// Computed properties
const isFormValid = computed(() => {
  return editForm.value.name.trim() !== '' &&
         editForm.value.category !== '' &&
         editForm.value.lat >= -90 &&
         editForm.value.lat <= 90 &&
         editForm.value.long >= -180 &&
         editForm.value.long <= 180
})

// Methods
const getCategoryColor = (category: string | undefined) => {
  if (!category) return props.categoryColors?.default || '#6b7280'
  const lowerCategory = category.toLowerCase()
  return props.categoryColors?.[lowerCategory] || props.categoryColors?.default || '#6b7280'
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return ''
  }
}

const resetForm = () => {
  if (props.poi) {
    editForm.value = {
      name: props.poi.name,
      category: props.poi.category,
      lat: props.poi.lat,
      long: props.poi.long
    }
  } else {
    editForm.value = {
      name: '',
      category: '',
      lat: 0,
      long: 0
    }
  }
  
  validationErrors.value = {
    name: '',
    category: '',
    lat: '',
    long: ''
  }
}

const validateForm = () => {
  validationErrors.value = {
    name: '',
    category: '',
    lat: '',
    long: ''
  }
  
  let isValid = true
  
  if (!editForm.value.name.trim()) {
    validationErrors.value.name = 'Name is required'
    isValid = false
  }
  
  if (!editForm.value.category) {
    validationErrors.value.category = 'Category is required'
    isValid = false
  }
  
  if (editForm.value.lat < -90 || editForm.value.lat > 90) {
    validationErrors.value.lat = 'Latitude must be between -90 and 90'
    isValid = false
  }
  
  if (editForm.value.long < -180 || editForm.value.long > 180) {
    validationErrors.value.long = 'Longitude must be between -180 and 180'
    isValid = false
  }
  
  return isValid
}

const handleSelect = () => {
  if (props.poi) {
    emit('select', props.poi.id)
  }
}

const startEditing = async () => {
  isEditing.value = true
  resetForm()
  
  await nextTick()
  if (nameInput.value) {
    nameInput.value.focus()
  }
}

const handleSave = async () => {
  if (!validateForm()) return
  
  isSaving.value = true
  
  try {
    if (props.isAdding) {
      emit('add-save', {
        name: editForm.value.name.trim(),
        category: editForm.value.category,
        lat: editForm.value.lat,
        long: editForm.value.long
      })
    } else if (props.poi) {
      emit('save', {
        ...props.poi,
        name: editForm.value.name.trim(),
        category: editForm.value.category,
        lat: editForm.value.lat,
        long: editForm.value.long
      })
    }
    
    isEditing.value = false
  } catch (error) {
    // Error handling is done in parent component
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  if (props.isAdding) {
    emit('add-cancel')
  } else {
    isEditing.value = false
    resetForm()
  }
}

const handleDelete = () => {
  if (props.poi) {
    emit('delete', props.poi)
  }
}

// Watch for poi changes to reset form
watch(() => props.poi, () => {
  if (props.poi && isEditing.value) {
    resetForm()
  }
}, { deep: true })

// Initialize form when component mounts
if (props.isAdding) {
  resetForm()
}
</script>

<style scoped>
/* Override table cell padding for better spacing with larger fonts */
td {
  padding: 24px 32px !important;
}

/* Ensure proper text sizing */
.text-xl {
  font-size: 20px !important;
  line-height: 1.4 !important;
}

.text-lg {
  font-size: 18px !important;
  line-height: 1.5 !important;
}

.text-base {
  font-size: 16px !important;
  line-height: 1.6 !important;
}

/* Input and button styling with corporate feel */
input, select {
  font-size: 18px !important;
  font-weight: 600 !important;
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}

button {
  font-size: 18px !important;
  font-weight: 700 !important;
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}

/* Enhanced category badge styling */
.category-badge {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.category-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Professional action buttons */
.flex.justify-end button {
  padding: 12px 24px !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  min-width: 100px;
}

/* Enhanced hover effects */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Corporate row styling */
tr:hover {
  background-color: #f8fafc !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Input focus styling */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

/* Professional typography */
* {
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}

/* Improved spacing for form elements */
.space-y-3 > * + * {
  margin-top: 0.75rem;
}

/* Error text styling */
p.text-red-600 {
  font-weight: 600 !important;
}

/* Checkbox styling */
input[type="checkbox"] {
  transform: scale(1.2);
  cursor: pointer;
}

input[type="checkbox"]:hover {
  transform: scale(1.3);
}

/* Action button group styling */
.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}
</style> 