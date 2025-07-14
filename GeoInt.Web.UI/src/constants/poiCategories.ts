/**
 * POI Category Colors
 * Colors used for category badges in table and map components
 */
export const POI_CATEGORY_COLORS: Record<string, string> = {
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

/**
 * Get color for a POI category
 * @param category - POI category name
 * @returns Hex color string
 */
export const getCategoryColor = (category: string | undefined): string => {
  if (!category) return POI_CATEGORY_COLORS.default
  return POI_CATEGORY_COLORS[category.toLowerCase()] || POI_CATEGORY_COLORS.default
} 