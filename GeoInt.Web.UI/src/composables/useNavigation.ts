import { ref, computed } from 'vue'

export type NavigationView = 'map' | 'pois'

export function useNavigation() {
  const currentView = ref<NavigationView>('map')
  
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