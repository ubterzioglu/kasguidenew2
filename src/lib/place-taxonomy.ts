/**
 * Place taxonomy helpers — imported by the admin pipeline and place detail pages.
 * All category data is now sourced from '@/lib/categories'.
 *
 * Exports are preserved for backward compatibility:
 *   - PLACE_CATEGORY_OPTIONS  (now covers all 21 categories, fixing a hidden validation bug)
 *   - getPlaceCategoryLabel
 *   - suggestCategoryFromRaw
 */

import { CATEGORIES, getCategoryLabel, suggestCategoryFromRaw as suggestFromCategories } from '@/lib/categories'

export type PlaceCategoryOption = {
  id: string
  label: string
  googleTypes: string[]
}

/** All 21 categories as pipeline options. Replaces the old 11-item list. */
export const PLACE_CATEGORY_OPTIONS: PlaceCategoryOption[] = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  googleTypes: c.googleTypes,
}))

/** Returns the display label for a category ID. */
export function getPlaceCategoryLabel(categoryId: string | null | undefined): string {
  return getCategoryLabel(categoryId)
}

/**
 * Suggests a category ID from a raw Google Places type string.
 * Falls back to 'aktivite' if no match is found.
 */
export function suggestCategoryFromRaw(rawCategory: string | null | undefined): string {
  return suggestFromCategories(rawCategory)
}
