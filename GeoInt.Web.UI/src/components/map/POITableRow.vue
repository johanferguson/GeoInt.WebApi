<template>
  <tr :class="[isSelected ? 'bg-geoint-50' : 'bg-white', 'hover:bg-gray-50']">
    <!-- Checkbox Column -->
    <td class="px-6 py-4 whitespace-nowrap">
      <input
        v-if="!isAdding"
        type="checkbox"
        :checked="isSelected"
        @change="handleSelect"
        class="h-4 w-4 text-geoint-600 focus:ring-geoint-500 border-gray-300 rounded"
      />
    </td>

    <!-- Name Column -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="!isEditing && !isAdding" class="text-sm font-medium text-gray-900">
        {{ poi?.name }}
      </div>
      <div v-else>
        <input
          v-model="editForm.name"
          type="text"
          ref="nameInput"
          placeholder="Enter POI name"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-geoint-500 focus:border-geoint-500"
          :class="{ 'border-red-300': validationErrors.name }"
        />
        <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600">
          {{ validationErrors.name }}
        </p>
      </div>
    </td>

    <!-- Category Column -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="!isEditing && !isAdding" class="text-sm text-gray-900">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {{ poi?.category }}
        </span>
      </div>
      <div v-else>
        <select
          v-model="editForm.category"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-geoint-500 focus:border-geoint-500"
          :class="{ 'border-red-300': validationErrors.category }"
        >
          <option value="">Select category</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <p v-if="validationErrors.category" class="mt-1 text-sm text-red-600">
          {{ validationErrors.category }}
        </p>
      </div>
    </td>

    <!-- Latitude Column -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="!isEditing && !isAdding" class="text-sm text-gray-900">
        {{ poi?.lat.toFixed(6) }}°
      </div>
      <div v-else>
        <input
          v-model.number="editForm.lat"
          type="number"
          step="0.000001"
          min="-90"
          max="90"
          placeholder="Latitude"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-geoint-500 focus:border-geoint-500"
          :class="{ 'border-red-300': validationErrors.lat }"
        />
        <p v-if="validationErrors.lat" class="mt-1 text-sm text-red-600">
          {{ validationErrors.lat }}
        </p>
      </div>
    </td>

    <!-- Longitude Column -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="!isEditing && !isAdding" class="text-sm text-gray-900">
        {{ poi?.long.toFixed(6) }}°
      </div>
      <div v-else>
        <input
          v-model.number="editForm.long"
          type="number"
          step="0.000001"
          min="-180"
          max="180"
          placeholder="Longitude"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-geoint-500 focus:border-geoint-500"
          :class="{ 'border-red-300': validationErrors.long }"
        />
        <p v-if="validationErrors.long" class="mt-1 text-sm text-red-600">
          {{ validationErrors.long }}
        </p>
      </div>
    </td>

    <!-- Created Date Column -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div v-if="!isAdding" class="text-sm text-gray-900">
        {{ formatDate(poi?.created_at) }}
      </div>
      <div v-else class="text-sm text-gray-500">
        -
      </div>
    </td>

    <!-- Actions Column -->
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <!-- Display Mode Actions -->
      <div v-if="!isEditing && !isAdding" class="flex justify-end space-x-2">
        <button
          @click="startEdit"
          class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit
        </button>
        <button
          @click="handleDelete"
          class="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete
        </button>
      </div>

      <!-- Edit/Add Mode Actions -->
      <div v-else class="flex justify-end space-x-2">
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-geoint-600 hover:bg-geoint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-geoint-500 disabled:opacity-50"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
        <button
          @click="handleCancel"
          :disabled="isSaving"
          class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Cancel
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { POI } from '../../entities/POI'

interface Props {
  poi?: POI
  isSelected?: boolean
  isAdding?: boolean
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
  isAdding: false
})

const emit = defineEmits<Emits>()

// Local state
const isEditing = ref(false)
const isSaving = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

// Common categories - in a real app, this might come from an API
const categories = ref([
  'Restaurant',
  'Hotel',
  'Tourist Attraction',
  'Shopping',
  'Entertainment',
  'Transportation',
  'Healthcare',
  'Education',
  'Government',
  'Business',
  'Park',
  'Museum',
  'Other'
])

// Form data
const editForm = reactive({
  name: '',
  category: '',
  lat: 0,
  long: 0
})

// Validation errors
const validationErrors = reactive({
  name: '',
  category: '',
  lat: '',
  long: ''
})

// Computed properties
const isInEditMode = computed(() => isEditing.value || props.isAdding)

// Methods
const initializeForm = () => {
  if (props.poi) {
    editForm.name = props.poi.name
    editForm.category = props.poi.category
    editForm.lat = props.poi.lat
    editForm.long = props.poi.long
  } else {
    editForm.name = ''
    editForm.category = ''
    editForm.lat = 0
    editForm.long = 0
  }
  clearValidationErrors()
}

const clearValidationErrors = () => {
  validationErrors.name = ''
  validationErrors.category = ''
  validationErrors.lat = ''
  validationErrors.long = ''
}

const validateForm = (): boolean => {
  clearValidationErrors()
  let isValid = true

  // Name validation
  if (!editForm.name || editForm.name.trim() === '') {
    validationErrors.name = 'POI name is required'
    isValid = false
  } else if (editForm.name.length > 100) {
    validationErrors.name = 'POI name must be less than 100 characters'
    isValid = false
  }

  // Category validation
  if (!editForm.category || editForm.category.trim() === '') {
    validationErrors.category = 'POI category is required'
    isValid = false
  } else if (editForm.category.length > 50) {
    validationErrors.category = 'POI category must be less than 50 characters'
    isValid = false
  }

  // Latitude validation
  if (editForm.lat < -90 || editForm.lat > 90) {
    validationErrors.lat = 'Latitude must be between -90 and 90'
    isValid = false
  }

  // Longitude validation
  if (editForm.long < -180 || editForm.long > 180) {
    validationErrors.long = 'Longitude must be between -180 and 180'
    isValid = false
  }

  return isValid
}

const handleSelect = () => {
  if (props.poi) {
    emit('select', props.poi.id)
  }
}

const startEdit = () => {
  initializeForm()
  isEditing.value = true
  
  // Focus on name input after DOM update
  nextTick(() => {
    nameInput.value?.focus()
  })
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  isSaving.value = true
  
  try {
    if (props.isAdding) {
      // Adding new POI
      const poiData = {
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        lat: editForm.lat,
        long: editForm.long
      }
      emit('add-save', poiData)
    } else if (props.poi) {
      // Updating existing POI
      const updatedPOI: POI = {
        ...props.poi,
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        lat: editForm.lat,
        long: editForm.long
      }
      emit('save', updatedPOI)
      isEditing.value = false
    }
  } catch (error) {
    // Error handling is done by parent component
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  if (props.isAdding) {
    emit('add-cancel')
  } else {
    isEditing.value = false
    initializeForm()
  }
}

const handleDelete = () => {
  if (props.poi) {
    emit('delete', props.poi)
  }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return '-'
  }
}

// Watch for prop changes
watch(() => props.poi, (newPOI) => {
  if (newPOI && !isEditing.value) {
    initializeForm()
  }
}, { immediate: true })

// Initialize form when component mounts
watch(() => props.isAdding, (adding) => {
  if (adding) {
    initializeForm()
    // Focus on name input after DOM update
    nextTick(() => {
      nameInput.value?.focus()
    })
  }
}, { immediate: true })
</script> 