import { ref, computed, readonly, type Ref } from 'vue'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig<T> {
  key: keyof T
  direction: SortDirection
  compare?: (a: T, b: T) => number
}

export interface SortableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  compare?: (a: T, b: T) => number
}

/**
 * Generic sorting composable that can be used with any data type
 */
export function useSorting<T extends Record<string, any>>(
  data: Ref<T[]>,
  defaultSortKey?: keyof T,
  defaultDirection: SortDirection = 'asc'
) {
  const sortColumn = ref<keyof T | null>(defaultSortKey || null)
  const sortDirection = ref<SortDirection>(defaultDirection)

  /**
   * Default comparison function for sorting
   */
  const defaultCompare = (a: T, b: T, key: keyof T): number => {
    const aVal = a[key]
    const bVal = b[key]

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    // Handle string values (case-insensitive)
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.toLowerCase().localeCompare(bVal.toLowerCase())
    }

    // Handle number values
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return aVal - bVal
    }

    // Handle date values
    if (aVal instanceof Date && bVal instanceof Date) {
      return aVal.getTime() - bVal.getTime()
    }

    // Handle boolean values
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return aVal === bVal ? 0 : aVal ? 1 : -1
    }

    // Fallback to string comparison
    return String(aVal).localeCompare(String(bVal))
  }

  /**
   * Sorted data computed property
   */
  const sortedData = computed(() => {
    if (!sortColumn.value) {
      return data.value
    }

    const sorted = [...data.value].sort((a, b) => {
      const result = defaultCompare(a, b, sortColumn.value!)
      return sortDirection.value === 'asc' ? result : -result
    })

    return sorted
  })

  /**
   * Sort by a specific column
   */
  const sortBy = (key: keyof T, direction?: SortDirection) => {
    if (sortColumn.value === key) {
      // Toggle direction if clicking the same column
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      // Set new column and direction
      sortColumn.value = key
      sortDirection.value = direction || 'asc'
    }
  }

  /**
   * Clear sorting
   */
  const clearSort = () => {
    sortColumn.value = null
    sortDirection.value = 'asc'
  }

  /**
   * Get sort indicator class for UI
   */
  const getSortIndicatorClass = (key: keyof T): string => {
    if (sortColumn.value !== key) {
      return 'sort-indicator sort-none'
    }
    return `sort-indicator sort-${sortDirection.value}`
  }

  /**
   * Check if a column is currently sorted
   */
  const isColumnSorted = (key: keyof T): boolean => {
    return sortColumn.value === key
  }

  /**
   * Get the current sort direction for a column
   */
  const getColumnSortDirection = (key: keyof T): SortDirection | null => {
    return sortColumn.value === key ? sortDirection.value : null
  }

  return {
    // State
    sortColumn: readonly(sortColumn),
    sortDirection: readonly(sortDirection),
    
    // Computed
    sortedData,
    
    // Methods
    sortBy,
    clearSort,
    getSortIndicatorClass,
    isColumnSorted,
    getColumnSortDirection
  }
}

/**
 * Composable for handling sortable table columns
 */
export function useSortableTable<T extends Record<string, any>>(
  data: Ref<T[]>,
  columns: SortableColumn<T>[],
  defaultSortKey?: keyof T
) {
  const sorting = useSorting(data, defaultSortKey)

  /**
   * Handle table header click
   */
  const handleHeaderClick = (column: SortableColumn<T>) => {
    if (column.sortable !== false) {
      sorting.sortBy(column.key)
    }
  }

  /**
   * Get header class for styling
   */
  const getHeaderClass = (column: SortableColumn<T>): string => {
    const baseClass = 'table-header'
    const sortableClass = column.sortable !== false ? 'sortable' : ''
    const sortIndicatorClass = column.sortable !== false ? sorting.getSortIndicatorClass(column.key) : ''
    
    return [baseClass, sortableClass, sortIndicatorClass].filter(Boolean).join(' ')
  }

  return {
    // From sorting composable
    ...sorting,
    
    // Table-specific
    columns,
    handleHeaderClick,
    getHeaderClass
  }
}

/**
 * Utility function to create a custom comparator
 */
export function createComparator<T>(
  compareFunction: (a: T, b: T) => number
): (a: T, b: T) => number {
  return compareFunction
}

/**
 * Pre-built comparators for common data types
 */
export const comparators = {
  string: <T>(key: keyof T) => createComparator<T>((a, b) => {
    const aVal = String(a[key]).toLowerCase()
    const bVal = String(b[key]).toLowerCase()
    return aVal.localeCompare(bVal)
  }),

  number: <T>(key: keyof T) => createComparator<T>((a, b) => {
    const aVal = Number(a[key])
    const bVal = Number(b[key])
    return aVal - bVal
  }),

  date: <T>(key: keyof T) => createComparator<T>((a, b) => {
    const aVal = new Date(a[key] as string)
    const bVal = new Date(b[key] as string)
    return aVal.getTime() - bVal.getTime()
  }),

  boolean: <T>(key: keyof T) => createComparator<T>((a, b) => {
    const aVal = Boolean(a[key])
    const bVal = Boolean(b[key])
    return aVal === bVal ? 0 : aVal ? 1 : -1
  })
} 