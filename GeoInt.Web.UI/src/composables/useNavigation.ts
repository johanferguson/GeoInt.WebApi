import { ref, computed } from 'vue'

export type NavigationView = 'map' | 'pois' | 'test'

// Create singleton state outside the composable
const currentView = ref<NavigationView>('map')

export function useNavigation() {
  const setView = (view: NavigationView) => {
    currentView.value = view
  }
  
  const isActive = computed(() => (view: NavigationView) => {
    return currentView.value === view
  })
  
  return {
    currentView,
    setView,
    isActive
  }
} 