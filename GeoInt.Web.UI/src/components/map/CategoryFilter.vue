<template>
  <div class="category-filter">
    <div class="filter-container">
      <div class="dropdown" :class="{ 'is-open': isOpen }">
        <button
          class="dropdown-trigger"
          @click="toggleDropdown"
          @blur="handleBlur"
          type="button"
        >
          <div class="trigger-content">
            <div class="selected-info">
              <span class="selected-text">
                {{ selectedCategory === null ? 'All Categories' : selectedCategory }}
              </span>
              <span class="selected-count">
                ({{ getFilteredCount() }} POIs)
              </span>
            </div>
            <svg 
              class="dropdown-icon" 
              :class="{ 'rotated': isOpen }"
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none"
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
        
        <div class="dropdown-menu" v-show="isOpen">
          <div class="dropdown-content">
            <button
              class="dropdown-item"
              :class="{ 'is-active': selectedCategory === null }"
              @click="selectCategory(null)"
            >
              <div class="item-content">
                <div class="category-dot all-categories"></div>
                <span class="category-name">All Categories</span>
                <span class="category-count">{{ totalPOIs }}</span>
              </div>
            </button>
            
            <div class="dropdown-divider"></div>
            
            <button
              v-for="category in categories"
              :key="category.name"
              class="dropdown-item"
              :class="{ 'is-active': selectedCategory === category.name }"
              @click="selectCategory(category.name)"
            >
              <div class="item-content">
                <div 
                  class="category-dot" 
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.count }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePOI } from '../../composables/usePOI'

interface Props {
  modelValue?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { pois, loadPOIs, isLoading } = usePOI()

const isOpen = ref(false)

const selectedCategory = computed({
  get: () => props.modelValue || null,
  set: (value) => emit('update:modelValue', value)
})

// Category colors mapping - same as in POILayer
const categoryColors: Record<string, string> = {
  facility: '#3b82f6',
  restaurant: '#ef4444',
  service: '#10b981',
  'shopping centre': '#f59e0b',
  'petrol station': '#8b5cf6',
  takeaway: '#f97316',
  transport: '#06b6d4',
  security: '#dc2626',
  parking: '#6b7280',
  library: '#7c3aed',
  'police station': '#1f2937',
  information: '#059669',
  business: '#0ea5e9',
  'shopping mall': '#eab308',
  monument: '#84cc16',
  hospital: '#ec4899',
  skyscraper: '#64748b',
  pub: '#f59e0b',
  'convention centre': '#8b5cf6',
  'government building': '#374151',
  management: '#6366f1',
  park: '#22c55e',
  unknown: '#9ca3af',
  default: '#6b7280'
}

const categories = computed(() => {
  const categoryMap = new Map<string, number>()
  
  pois.value.forEach(poi => {
    // Handle null/undefined categories
    const category = poi.category ? poi.category.toLowerCase() : 'unknown'
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })
  
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      color: categoryColors[name] || categoryColors.default
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
})

const totalPOIs = computed(() => pois.value.length)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleBlur = (event: FocusEvent) => {
  // Close dropdown when clicking outside
  setTimeout(() => {
    if (!event.relatedTarget || !event.currentTarget?.contains(event.relatedTarget as Node)) {
      isOpen.value = false
    }
  }, 150)
}

const selectCategory = (category: string | null) => {
  console.log('CategoryFilter: Selecting category:', category)
  selectedCategory.value = category
  isOpen.value = false
  
  // Force emit the change to ensure parent components are notified
  emit('update:modelValue', category)
}

const getCategoryCount = (categoryName: string): number => {
  return pois.value.filter(poi => 
    poi.category && poi.category.toLowerCase() === categoryName.toLowerCase()
  ).length
}

const getFilteredCount = (): number => {
  if (selectedCategory.value === null) {
    return totalPOIs.value
  }
  return getCategoryCount(selectedCategory.value)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const dropdown = document.querySelector('.dropdown')
  if (dropdown && !dropdown.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Watch for external changes to selectedCategory
watch(() => selectedCategory.value, (newValue, oldValue) => {
  console.log('CategoryFilter: selectedCategory changed from', oldValue, 'to', newValue)
})

// Watch for POI changes to debug category updates
watch(() => pois.value.length, (newLength, oldLength) => {
  console.log('CategoryFilter: POI count changed from', oldLength, 'to', newLength)
  console.log('CategoryFilter: Categories updated:', categories.value)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Load POIs when component mounts (only if not already loaded)
  if (pois.value.length === 0) {
    console.log('CategoryFilter: Loading POIs since array is empty')
    loadPOIs()
  } else {
    console.log('CategoryFilter: POIs already loaded, count:', pois.value.length)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.category-filter {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.filter-container {
  min-width: 280px;
}

.dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-trigger {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dropdown-trigger:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.dropdown.is-open .dropdown-trigger {
  background: rgba(255, 255, 255, 1);
  border-color: #3498db;
  box-shadow: 0 6px 25px rgba(52, 152, 219, 0.2);
}

.trigger-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.selected-text {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
}

.selected-count {
  font-size: 16px;
  color: #7f8c8d;
  font-weight: 500;
}

.dropdown-icon {
  color: #7f8c8d;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  width: 100%;
  background: none;
  border: none;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: inherit;
}

.dropdown-item:hover {
  background: rgba(52, 152, 219, 0.08);
}

.dropdown-item.is-active {
  background: rgba(52, 152, 219, 0.12);
  color: #3498db;
}

.dropdown-item.is-active .category-name {
  font-weight: 600;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-dot.all-categories {
  background: linear-gradient(45deg, #3498db, #2ecc71, #e74c3c, #f39c12);
  background-size: 400% 400%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.category-name {
  flex: 1;
  font-size: 19px;
  font-weight: 500;
  color: #2c3e50;
}

.category-count {
  font-size: 16px;
  color: #7f8c8d;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  min-width: 30px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 8px 16px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .category-filter {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .filter-container {
    min-width: auto;
  }
  
  .dropdown-trigger {
    padding: 14px 16px;
  }
  
  .selected-text {
    font-size: 15px;
  }
  
  .dropdown-content {
    max-height: 250px;
  }
}
</style> 