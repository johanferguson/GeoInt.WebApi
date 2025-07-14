import { ref, computed, watch, type Ref } from 'vue'
import type { POI } from '../entities/POI'

/**
 * Composable for POI table pagination functionality
 * Handles page size, current page, page navigation, and paginated data
 */
export function usePOITablePagination(sortedPOIs: Ref<POI[]>) {
  const currentPage = ref(1)
  const pageSize = ref<number>(10)

  const totalPages = computed(() => Math.ceil(sortedPOIs.value.length / Number(pageSize.value)))
  const startIndex = computed(() => (currentPage.value - 1) * Number(pageSize.value))
  const endIndex = computed(() => Math.min(startIndex.value + Number(pageSize.value), sortedPOIs.value.length))

  const paginatedPOIs = computed(() => {
    const size = Number(pageSize.value)
    const start = (currentPage.value - 1) * size
    const end = Math.min(start + size, sortedPOIs.value.length)
    // Create a shallow copy to avoid affecting original data
    return [...sortedPOIs.value].slice(start, end)
  })

  const visiblePages = computed(() => {
    const pages: (number | string)[] = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
      // Show all pages
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Show abbreviated pagination
      pages.push(1)
      
      if (current > 4) {
        pages.push('...')
      }
      
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (current < total - 3) {
        pages.push('...')
      }
      
      if (total > 1) {
        pages.push(total)
      }
    }
    
    return pages
  })

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const goToPage = (page: number | string) => {
    if (typeof page === 'number') {
      currentPage.value = page
    }
  }

  const handlePageSizeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    pageSize.value = Number(target.value)
    currentPage.value = 1
  }

  // Watch for sorted POIs changes and adjust current page if needed
  watch(sortedPOIs, (newPOIs) => {
    const maxPage = Math.ceil(newPOIs.length / Number(pageSize.value))
    if (currentPage.value > maxPage && maxPage > 0) {
      currentPage.value = maxPage
    }
  }, { immediate: true })

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    paginatedPOIs,
    visiblePages,
    previousPage,
    nextPage,
    goToPage,
    handlePageSizeChange
  }
} 