'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])
  const [draftCategoryIds, setDraftCategoryIds] = useState<string[]>([])
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

  function submitSearch() {
    const normalizedQuery = searchQuery.trim()

    if (!normalizedQuery) {
      router.push('/arama')
      return
    }

    router.push(`/arama?q=${encodeURIComponent(normalizedQuery)}`)
  }

  function setImmediateCategoryIds(nextCategoryIds: string[]) {
    setActiveCategoryIds(nextCategoryIds)
    setDraftCategoryIds(nextCategoryIds)
  }

  function toggleCategoryFilter(categoryId: string) {
    setActiveCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
  }

  function toggleDraftCategoryFilter(categoryId: string) {
    setDraftCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
  }

  function openMobileCategorySheet() {
    setDraftCategoryIds(activeCategoryIds)
    setIsMobileCategoryMenuOpen(true)
  }

  function closeMobileCategorySheet() {
    setDraftCategoryIds(activeCategoryIds)
    setIsMobileCategoryMenuOpen(false)
  }

  function applyMobileCategories() {
    setActiveCategoryIds(draftCategoryIds)
    setIsMobileCategoryMenuOpen(false)
  }

  function clearMobileCategories() {
    setDraftCategoryIds([])
    setActiveCategoryIds([])
    setIsMobileCategoryMenuOpen(false)
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
      setCategoryStatus(`${selectedCategoryNames.join(', ')} için mekanlar yükleniyor...`)

      try {
        const response = await fetch(
          `/api/places?categories=${encodeURIComponent(activeCategoryIds.join(','))}&limit=${MAX_HOME_RESULTS}`,
          { cache: 'no-store' },
        )

        const payload = (await response.json()) as PlacesEnvelope

        if (!response.ok) {
          throw new Error(payload.error || 'Mekanlar yüklenemedi.')
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
            ? `${selectedCategoryNames.join(', ')} için ${totalCount} yayın kaydı bulundu.`
            : 'Seçili kategoriler için henüz yayında mekan yok.',
        )
      } catch (error) {
        if (cancelled) {
          return
        }

        setCategoryPlaces([])
        setHasMoreResults(false)
        setCategoryStatus(error instanceof Error ? error.message : 'Mekanlar yüklenemedi.')
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
            <h2 className="section-title">Kaş&apos;ta gezilecek yerler, restoranlar ve aktiviteler nasıl bulunur?</h2>
          </div>
          <div className="category-topline-actions">
            <button
              type="button"
              className="category-clear-filters"
              onClick={() => setImmediateCategoryIds([])}
              disabled={activeCategoryIds.length === 0}
            >
              Filtreleri temizle
            </button>
            <span className="category-topline-separator" aria-hidden="true"></span>
            <span className="category-filter-count">{`${activeCategoryIds.length} aktif filtre`}</span>
            <button
              type="button"
              className="category-mobile-trigger"
              onClick={openMobileCategorySheet}
              aria-label="Kategori menüsünü aç"
            >
              Kategori seç
            </button>
          </div>
        </div>

        <CategoryTileStrip
          activeCategoryIds={activeCategoryIds}
          counts={categoryCounts}
          onToggleCategory={toggleCategoryFilter}
        />

        <div className="category-mobile-selection-summary" aria-live="polite">
          {activeCategoryIds.length > 0 ? (
            <>
              <div className="category-mobile-chip-list">
                {activeCategoryIds.map((categoryId) => {
                  const category = CATEGORY_MAP.get(categoryId)
                  if (!category) {
                    return null
                  }

                  return (
                    <button
                      key={`selected-${categoryId}`}
                      type="button"
                      className="category-mobile-chip"
                      onClick={() =>
                        setImmediateCategoryIds(activeCategoryIds.filter((id) => id !== categoryId))
                      }
                    >
                      <span>{category.label}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  )
                })}
              </div>
              <p className="category-mobile-summary-copy">
                Seçili filtreleri kaldırabilir veya yeni kategori eklemek için sheet&apos;i açabilirsin.
              </p>
            </>
          ) : (
            <p className="category-mobile-summary-copy">
              İlk kez geliyorsan önce ilgi alanını seç. Plaj, restoran, dalış veya gece hayatına göre hızlı daraltma yap.
            </p>
          )}
        </div>

        <div
          className={`category-mobile-backdrop${isMobileCategoryMenuOpen ? ' is-open' : ''}`}
          onClick={closeMobileCategorySheet}
        ></div>
        <aside
          className={`category-mobile-drawer${isMobileCategoryMenuOpen ? ' is-open' : ''}`}
          aria-label="Mobil kategori filtreleri"
        >
          <div className="category-mobile-drawer-head">
            <div className="category-mobile-drawer-copy">
              <strong>Kategori seç</strong>
              <p>Önce ilgi alanlarını işaretle, sonra uygula.</p>
            </div>
            <button
              type="button"
              className="category-mobile-close"
              onClick={closeMobileCategorySheet}
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

              const isDraftActive = draftCategoryIds.includes(categoryId)

              return (
                <label key={categoryId} className="category-mobile-option">
                  <input
                    type="checkbox"
                    checked={isDraftActive}
                    onChange={() => toggleDraftCategoryFilter(categoryId)}
                  />
                  <span>{category.label}</span>
                  <strong>{categoryCounts[category.id] ?? 0}</strong>
                </label>
              )
            })}
          </div>
          <div className="category-mobile-drawer-actions">
            <button
              type="button"
              className="category-mobile-secondary-action"
              onClick={clearMobileCategories}
              disabled={activeCategoryIds.length === 0 && draftCategoryIds.length === 0}
            >
              Temizle
            </button>
            <button
              type="button"
              className="category-mobile-primary-action"
              onClick={applyMobileCategories}
            >
              {draftCategoryIds.length > 0 ? `${draftCategoryIds.length} filtreyi uygula` : 'Filtreleri uygula'}
            </button>
          </div>
        </aside>

        <div className="search-box category-search-box">
          <input
            id="category-search"
            type="text"
            placeholder="Kaş'ta ara..."
            className="search-input"
            aria-label="Mekan ara"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submitSearch()
              }
            }}
          />
          <button type="button" className="search-button" aria-label="Aramayı çalıştır" onClick={submitSearch}>
            Ara
          </button>
        </div>

        <section className="category-results-shell">
          {activeCategoryIds.length > 0 ? (
            <div className="category-results-header">
              <div>
                <h3 className="category-results-title">
                  {`${activeCategoryIds.length} kategori için seçilen mekanlar`}
                </h3>
                {isCategoryLoading || filteredCategoryPlaces.length > 0 ? (
                  <p className="category-results-copy">
                    {normalizedSearchQuery && categoryPlaces.length > 0
                      ? `"${searchQuery}" için ${filteredCategoryPlaces.length} sonuç gösteriliyor.`
                      : hasMoreResults
                        ? `${categoryStatus} Ana sayfada ilk ${MAX_HOME_RESULTS} kayıt gösteriliyor.`
                        : categoryStatus}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeCategoryIds.length > 0 ? (
            isCategoryLoading ? (
              <div className="category-results-empty">Mekanlar yükleniyor...</div>
            ) : filteredCategoryPlaces.length === 0 ? (
              <div className="category-results-empty category-results-empty-centered">
                {normalizedSearchQuery
                  ? 'Aramana uyan sonuç bulunamadı. Filtreleri ya da arama kelimeni değiştir.'
                  : 'Seçili kategoriler için henüz yayına alınmış mekan yok.'}
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
                      Daha fazla gör
                    </Link>
                  </div>
                ) : null}
              </>
            )
          ) : (
            <div className="category-results-empty category-results-empty-centered">
              Kategorini seç! Sonuçlar burada gözükecek. İstersen plaj, restoran veya dalış gibi en çok aranan
              başlıklardan başlayabilirsin.
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
