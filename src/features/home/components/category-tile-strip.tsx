'use client'

import Link from 'next/link'

import { CATEGORY_IDS, CATEGORY_MAP } from '@/lib/categories'

type CategoryTileStripProps = {
  activeCategoryIds: string[]
  counts?: Record<string, number>
  onToggleCategory?: (categoryId: string) => void
  hrefBuilder?: (categoryId: string, nextSelectedIds: string[]) => string
}

export function CategoryTileStrip({
  activeCategoryIds,
  counts = {},
  onToggleCategory,
  hrefBuilder,
}: CategoryTileStripProps) {
  return (
    <div className="category-pill-list category-pill-list-all">
      {CATEGORY_IDS.map((categoryId) => {
        const category = CATEGORY_MAP.get(categoryId)

        if (!category) {
          return null
        }

        const isActive = activeCategoryIds.includes(categoryId)
        const nextSelectedIds = isActive
          ? activeCategoryIds.filter((item) => item !== categoryId)
          : [...activeCategoryIds, categoryId]
        const tileClassName = `category-tile category-tile-${category.tone ?? 'food'}${isActive ? ' is-active' : ''}`
        const content = (
          <span className="category-tile-main">
            <span className="category-tile-icon" aria-hidden="true">
              {category.icon ?? '•'}
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
        )

        if (hrefBuilder) {
          return (
            <Link key={categoryId} href={hrefBuilder(categoryId, nextSelectedIds)} className={tileClassName}>
              {content}
            </Link>
          )
        }

        return (
          <button
            key={categoryId}
            type="button"
            className={tileClassName}
            onClick={() => onToggleCategory?.(categoryId)}
            aria-pressed={isActive}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
