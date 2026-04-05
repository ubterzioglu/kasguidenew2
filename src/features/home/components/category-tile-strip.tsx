'use client'

import { CATEGORY_IDS, CATEGORY_MAP } from '@/lib/categories'

type CategoryTileStripProps = {
  activeCategoryIds: string[]
  counts?: Record<string, number>
  onToggleCategory?: (categoryId: string) => void
}

export function CategoryTileStrip({ activeCategoryIds, counts = {}, onToggleCategory }: CategoryTileStripProps) {
  return (
    <div className="category-pill-list category-pill-list-all">
      {CATEGORY_IDS.map((categoryId) => {
        const category = CATEGORY_MAP.get(categoryId)

        if (!category) {
          return null
        }

        const isActive = activeCategoryIds.includes(categoryId)
        const tileClassName = `category-tile category-tile-${category.tone ?? 'food'}${isActive ? ' is-active' : ''}`

        return (
          <button
            key={categoryId}
            type="button"
            className={tileClassName}
            onClick={() => onToggleCategory?.(categoryId)}
            aria-pressed={isActive}
          >
            <span className="category-tile-main">
              <span className="category-tile-icon" aria-hidden="true">
                {category.icon ?? '*'}
              </span>
              <span className="category-tile-separator" aria-hidden="true">
                |
              </span>
              <strong className="category-tile-label">{category.label}</strong>
              <span className="category-tile-separator" aria-hidden="true">
                |
              </span>
              <span className="category-tile-count">{counts[category.id] ?? 0}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
