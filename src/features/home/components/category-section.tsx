'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { CATEGORY_IDS, CATEGORY_MAP } from '@/lib/categories'

import { CategoryPlaceCard } from './category-place-card'
import { CategoryTileStrip } from './category-tile-strip'
import type { CategoryPlace } from './types'

const MAX_HOME_RESULTS = 4

type PlacesEnvelope = {
  places?: CategoryPlace[]
  hasMore?: boolean
  error?: string
}

export function CategorySection() {
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [categoryPlaces, setCategoryPlaces] = useState<CategoryPlace[]>([])
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [isMobileCategoryMenuOpen, setIsMobileCategoryMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryStatus, setCategoryStatus] = useState('')
  const [hasMoreResults, setHasMoreResults] = useState(false)

  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('tr')
  const filteredCategoryPlaces = useMemo(() => {
    return categoryPlaces.filter((place) => {
      if (!normalizedSearchQuery) {
        return true
      }

      return [
        place.name,
        place.headline,
        place.shortDescription,
        place.address ?? '',
        CATEGORY_MAP.get(place.categoryPrimary)?.label ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase('tr')
        .includes(normalizedSearchQuery)
    })
  }, [categoryPlaces, normalizedSearchQuery])

  const limitedCategoryPlaces = filteredCategoryPlaces.slice(0, MAX_HOME_RESULTS)
  const resultHref = activeCategoryIds.length > 0
    ? `/result?categories=${encodeURIComponent(activeCategoryIds.join(','))}`
    : '/result'

  function toggleCategoryFilter(categoryId: string) {
    setActiveCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
  }

  useEffect(() => {
    let cancelled = false

    async function loadCategoryCounts() {
      try {
        const response = await fetch('/api/place-counts', { cache: 'no-store' })
        const payload = (await response.json()) as { counts?: Record<string, number>; error?: string } | undefined

        if (!response.ok || !payload?.counts || cancelled) {
          return
        }

        setCategoryCounts(payload.counts)
      } catch {
        if (!cancelled) {
          setCategoryCounts({})
        }
      }
    }

    void loadCategoryCounts()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCategoryPlaces() {
      if (activeCategoryIds.length === 0) {
        setCategoryPlaces([])
        setHasMoreResults(false)
        setIsCategoryLoading(false)
        setCategoryStatus('')
        return
      }

      const selectedCategoryNames = activeCategoryIds
        .map((categoryId) => CATEGORY_MAP.get(categoryId)?.label || categoryId)
        .filter(Boolean)

      setIsCategoryLoading(true)
      setCategoryStatus(`${selectedCategoryNames.join(', ')} icin mekanlar yukleniyor...`)

      try {
        const response = await fetch(
          `/api/places?categories=${encodeURIComponent(activeCategoryIds.join(','))}&limit=${MAX_HOME_RESULTS}`,
          { cache: 'no-store' },
        )

        const payload = (await response.json()) as PlacesEnvelope

        if (!response.ok) {
          throw new Error(payload.error || 'Mekanlar yuklenemedi.')
        }

        if (cancelled) {
          return
        }

        const places = payload.places ?? []
        const totalCount = activeCategoryIds.reduce((sum, categoryId) => sum + (categoryCounts[categoryId] ?? 0), 0)

        setCategoryPlaces(places)
        setHasMoreResults(Boolean(payload.hasMore))
        setCategoryStatus(
          totalCount > 0
            ? `${selectedCategoryNames.join(', ')} icin ${totalCount} yayin kaydi bulundu.`
            : 'Secili kategoriler icin henuz yayinda mekan yok.',
        )
      } catch (error) {
        if (cancelled) {
          return
        }

        setCategoryPlaces([])
        setHasMoreResults(false)
        setCategoryStatus(error instanceof Error ? error.message : 'Mekanlar yuklenemedi.')
      } finally {
        if (!cancelled) {
          setIsCategoryLoading(false)
        }
      }
    }

    void loadCategoryPlaces()

    return () => {
      cancelled = true
    }
  }, [activeCategoryIds, categoryCounts])

  useEffect(() => {
    if (!isMobileCategoryMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileCategoryMenuOpen])

  return (
    <section className="home-categories-section">
      <div className="category-section-shell" id="categories">
        <div className="category-topline">
          <div>
            <h3 className="section-title">Kendi Kas senaryonu kur! Kategorini sec!</h3>
          </div>
          <div className="category-topline-actions">
            <button
              type="button"
              className="category-clear-filters"
              onClick={() => setActiveCategoryIds([])}
              disabled={activeCategoryIds.length === 0}
            >
              Filtreleri temizle
            </button>
            <span className="category-topline-separator" aria-hidden="true"></span>
            <span className="category-filter-count">{`${activeCategoryIds.length} aktif filtre`}</span>
            <button
              type="button"
              className="category-mobile-trigger"
              onClick={() => setIsMobileCategoryMenuOpen(true)}
              aria-label="Kategori menusunu ac"
            >
              Kategoriler
            </button>
          </div>
        </div>

        <CategoryTileStrip
          activeCategoryIds={activeCategoryIds}
          counts={categoryCounts}
          onToggleCategory={toggleCategoryFilter}
        />

        <div
          className={`category-mobile-backdrop${isMobileCategoryMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMobileCategoryMenuOpen(false)}
        ></div>
        <aside
          className={`category-mobile-drawer${isMobileCategoryMenuOpen ? ' is-open' : ''}`}
          aria-label="Mobil kategori filtreleri"
        >
          <div className="category-mobile-drawer-head">
            <strong>Kategori Sec</strong>
            <button
              type="button"
              className="category-mobile-close"
              onClick={() => setIsMobileCategoryMenuOpen(false)}
              aria-label="Kategorileri kapat"
            >
              X
            </button>
          </div>
          <div className="category-mobile-list">
            {CATEGORY_IDS.map((categoryId) => {
              const category = CATEGORY_MAP.get(categoryId)
              if (!category) {
                return null
              }

              const checked = activeCategoryIds.includes(categoryId)

              return (
                <label key={categoryId} className="category-mobile-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategoryFilter(categoryId)}
                  />
                  <span>{category.label}</span>
                </label>
              )
            })}
          </div>
        </aside>

        <div className="search-box category-search-box">
          <input
            id="category-search"
            type="text"
            placeholder="Kas'ta ara..."
            className="search-input"
            aria-label="Mekan ara"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button type="button" className="search-button" aria-label="Aramayi calistir">
            Ara
          </button>
        </div>

        <section className="category-results-shell">
          {activeCategoryIds.length > 0 ? (
            <div className="category-results-header">
              <div>
                <h4 className="category-results-title">
                  {`${activeCategoryIds.length} kategori icin secilen mekanlar`}
                </h4>
                {isCategoryLoading || filteredCategoryPlaces.length > 0 ? (
                  <p className="category-results-copy">
                    {normalizedSearchQuery && categoryPlaces.length > 0
                      ? `"${searchQuery}" icin ${filteredCategoryPlaces.length} sonuc gosteriliyor.`
                      : hasMoreResults
                        ? `${categoryStatus} Ana sayfada ilk ${MAX_HOME_RESULTS} kayit gosteriliyor.`
                        : categoryStatus}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeCategoryIds.length > 0 ? (
            isCategoryLoading ? (
              <div className="category-results-empty">Mekanlar yukleniyor...</div>
            ) : filteredCategoryPlaces.length === 0 ? (
              <div className="category-results-empty category-results-empty-centered">
                {normalizedSearchQuery
                  ? 'Aramana uyan sonuc bulunamadi. Filtreleri ya da arama kelimeni degistir.'
                  : 'Secili kategoriler icin henuz yayina alinmis mekan yok.'}
              </div>
            ) : (
              <>
                <div className="category-results-grid">
                  {limitedCategoryPlaces.map((place) => (
                    <CategoryPlaceCard key={place.id} place={place} />
                  ))}
                </div>

                {hasMoreResults ? (
                  <div className="category-results-actions">
                    <Link href={resultHref} className="category-results-more-link">
                      Daha fazla gor
                    </Link>
                  </div>
                ) : null}
              </>
            )
          ) : (
            <div className="category-results-empty category-results-empty-centered">
              Kategorini sec! Sonuclar burada gozukecek.
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
