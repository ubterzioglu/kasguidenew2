'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CategoryPlaceCard } from '@/features/home/components/category-place-card'
import { CategoryTileStrip } from '@/features/home/components/category-tile-strip'
import type { CategoryPlace } from '@/features/home/components/types'
import { CATEGORY_MAP } from '@/lib/categories'

const PAGE_SIZE = 12

type PlacesEnvelope = {
  categories?: string[]
  places?: CategoryPlace[]
  hasMore?: boolean
  error?: string
}

type ResultsPageClientProps = {
  initialCategoryIds: string[]
}

export function ResultsPageClient({ initialCategoryIds }: ResultsPageClientProps) {
  const router = useRouter()
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [places, setPlaces] = useState<CategoryPlace[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])

  const normalizedCategoryIds = useMemo(
    () => [...new Set(initialCategoryIds.map((item) => item.trim()).filter(Boolean))],
    [initialCategoryIds],
  )

  useEffect(() => {
    setActiveCategoryIds(normalizedCategoryIds)
  }, [normalizedCategoryIds])

  const activeCategoryLabels = useMemo(
    () => activeCategoryIds.map((item) => CATEGORY_MAP.get(item)?.label || item),
    [activeCategoryIds],
  )

  const totalCount = useMemo(
    () => activeCategoryIds.reduce((sum, categoryId) => sum + (categoryCounts[categoryId] ?? 0), 0),
    [activeCategoryIds, categoryCounts],
  )

  useEffect(() => {
    let cancelled = false

    async function loadCounts() {
      try {
        const response = await fetch('/api/place-counts', { cache: 'no-store' })
        const payload = (await response.json()) as { counts?: Record<string, number> }

        if (!response.ok || !payload.counts || cancelled) {
          return
        }

        setCategoryCounts(payload.counts)
      } catch {
        if (!cancelled) {
          setCategoryCounts({})
        }
      }
    }

    void loadCounts()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialPlaces() {
      if (activeCategoryIds.length === 0) {
        setPlaces([])
        setHasMore(false)
        setStatusMessage('Sonuç görmek için en az bir kategori seçin.')
        return
      }

      setIsLoading(true)
      setStatusMessage('Sonuçlar yükleniyor...')

      try {
        const response = await fetch(
          `/api/places?categories=${encodeURIComponent(activeCategoryIds.join(','))}&limit=${PAGE_SIZE}&offset=0`,
          { cache: 'no-store' },
        )
        const payload = (await response.json()) as PlacesEnvelope

        if (!response.ok) {
          throw new Error(payload.error || 'Sonuçlar yüklenemedi.')
        }

        if (cancelled) {
          return
        }

        const nextPlaces = payload.places ?? []

        setPlaces(nextPlaces)
        setHasMore(Boolean(payload.hasMore))
        setStatusMessage(
          totalCount > 0
            ? `${activeCategoryLabels.join(', ')} için sonuçlar hazır.`
            : 'Seçili kategoriler için yayınlanmış mekan bulunamadı.',
        )
      } catch (error) {
        if (!cancelled) {
          setPlaces([])
          setHasMore(false)
          setStatusMessage(error instanceof Error ? error.message : 'Sonuçlar yüklenemedi.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialPlaces()

    return () => {
      cancelled = true
    }
  }, [activeCategoryIds, activeCategoryLabels, totalCount])

  function handleToggleCategory(categoryId: string) {
    const nextSelectedIds = activeCategoryIds.includes(categoryId)
      ? activeCategoryIds.filter((item) => item !== categoryId)
      : [...activeCategoryIds, categoryId]

    setActiveCategoryIds(nextSelectedIds)

    const query = nextSelectedIds.length > 0 ? `?categories=${encodeURIComponent(nextSelectedIds.join(','))}` : ''
    router.push(`/result${query}`, { scroll: false })
  }

  function clearFilters() {
    setActiveCategoryIds([])
    router.push('/result', { scroll: false })
  }

  async function loadMore() {
    if (activeCategoryIds.length === 0 || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)

    try {
      const response = await fetch(
        `/api/places?categories=${encodeURIComponent(activeCategoryIds.join(','))}&limit=${PAGE_SIZE}&offset=${places.length}`,
        { cache: 'no-store' },
      )
      const payload = (await response.json()) as PlacesEnvelope

      if (!response.ok) {
        throw new Error(payload.error || 'Ek sonuçlar yüklenemedi.')
      }

      const incomingPlaces = payload.places ?? []
      const seen = new Set(places.map((item) => item.id))
      const merged = [...places]

      for (const place of incomingPlaces) {
        if (!seen.has(place.id)) {
          merged.push(place)
          seen.add(place.id)
        }
      }

      setPlaces(merged)
      setHasMore(Boolean(payload.hasMore))
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Ek sonuçlar yüklenemedi.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <main className="result-page">
      <section className="home-categories-section result-page-section">
        <div className="category-section-shell result-page-shell">
          <div className="category-topline">
            <div>
              <h1 className="section-title">Seçilen Kategorilere Göre Mekanlar</h1>
              <div className="result-page-copy-block">
                <p className="category-results-copy result-page-copy">
                  {`Seçili Filtreler: ${activeCategoryLabels.length > 0 ? activeCategoryLabels.join(', ') : 'Henüz seçim yapılmadı'}`}
                </p>
                <p className="category-results-copy result-page-copy">{`Bulunan Kayıt: ${totalCount}`}</p>
                {statusMessage ? <p className="result-page-status-note">{statusMessage}</p> : null}
              </div>
            </div>

            <div className="category-topline-actions result-page-topline-actions">
              <span className="category-filter-count">{`Aktif filtre: ${activeCategoryIds.length}`}</span>
              <span className="category-topline-separator" aria-hidden="true"></span>
              <button
                type="button"
                className="category-clear-filters"
                onClick={clearFilters}
                disabled={activeCategoryIds.length === 0}
              >
                Filtreyi temizle
              </button>
            </div>
          </div>

          <CategoryTileStrip
            activeCategoryIds={activeCategoryIds}
            counts={categoryCounts}
            onToggleCategory={handleToggleCategory}
          />

          <section className="category-results-shell result-page-results">
            {isLoading ? (
              <div className="category-results-empty">Sonuçlar yükleniyor...</div>
            ) : places.length === 0 ? (
              <div className="category-results-empty category-results-empty-centered">
                {activeCategoryIds.length === 0
                  ? 'Lütfen en az bir kategori seçin.'
                  : 'Seçili kategoriler için gösterilecek mekan bulunamadı.'}
              </div>
            ) : (
              <>
                <div className="category-results-grid result-page-grid">
                  {places.map((place) => (
                    <CategoryPlaceCard key={place.id} place={place} />
                  ))}
                </div>

                {hasMore ? (
                  <div className="category-results-actions">
                    <Button type="button" variant="secondary" onClick={loadMore} disabled={isLoadingMore}>
                      {isLoadingMore ? 'Yükleniyor...' : 'Daha fazla yükle'}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
