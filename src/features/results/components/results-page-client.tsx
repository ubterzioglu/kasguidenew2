'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { CategoryPlaceCard } from '@/features/home/components/category-place-card'
import { CategoryTileStrip } from '@/features/home/components/category-tile-strip'
import type { CategoryPlace } from '@/features/home/components/types'
import { Button } from '@/components/ui/button'
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
  const [status, setStatus] = useState('')
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])

  const normalizedCategoryIds = useMemo(
    () => [...new Set(initialCategoryIds.map((item) => item.trim()).filter(Boolean))],
    [initialCategoryIds],
  )

  useEffect(() => {
    setActiveCategoryIds(normalizedCategoryIds)
  }, [normalizedCategoryIds])

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
        setStatus('Bir veya daha fazla kategori sec.')
        return
      }

      setIsLoading(true)
      setStatus('Sonuclar yukleniyor...')

      try {
        const response = await fetch(
          `/api/places?categories=${encodeURIComponent(activeCategoryIds.join(','))}&limit=${PAGE_SIZE}&offset=0`,
          { cache: 'no-store' },
        )
        const payload = (await response.json()) as PlacesEnvelope

        if (!response.ok) {
          throw new Error(payload.error || 'Sonuclar yuklenemedi.')
        }

        if (cancelled) {
          return
        }

        const nextPlaces = payload.places ?? []
        const totalCount = activeCategoryIds.reduce((sum, categoryId) => sum + (categoryCounts[categoryId] ?? 0), 0)

        setPlaces(nextPlaces)
        setHasMore(Boolean(payload.hasMore))
        setStatus(
          totalCount > 0
            ? `${activeCategoryIds.map((item) => CATEGORY_MAP.get(item)?.label || item).join(', ')} icin ${totalCount} yayin kaydi bulundu.`
            : 'Secili kategoriler icin yayinlanmis mekan bulunamadi.',
        )
      } catch (error) {
        if (!cancelled) {
          setPlaces([])
          setHasMore(false)
          setStatus(error instanceof Error ? error.message : 'Sonuclar yuklenemedi.')
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
  }, [activeCategoryIds, categoryCounts])

  function handleToggleCategory(categoryId: string) {
    const nextSelectedIds = activeCategoryIds.includes(categoryId)
      ? activeCategoryIds.filter((item) => item !== categoryId)
      : [...activeCategoryIds, categoryId]

    setActiveCategoryIds(nextSelectedIds)

    const query = nextSelectedIds.length > 0 ? `?categories=${encodeURIComponent(nextSelectedIds.join(','))}` : ''
    router.push(`/result${query}`, { scroll: false })
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
        throw new Error(payload.error || 'Ek sonuclar yuklenemedi.')
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
      setStatus(error instanceof Error ? error.message : 'Ek sonuclar yuklenemedi.')
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
              <h1 className="section-title">Kategori Sonuclari</h1>
              <p className="category-results-copy result-page-copy">{status}</p>
            </div>
          </div>

          <CategoryTileStrip
            activeCategoryIds={activeCategoryIds}
            counts={categoryCounts}
            onToggleCategory={handleToggleCategory}
          />

          <section className="category-results-shell result-page-results">
            {isLoading ? (
              <div className="category-results-empty">Sonuclar yukleniyor...</div>
            ) : places.length === 0 ? (
              <div className="category-results-empty category-results-empty-centered">
                Secili kategoriler icin gosterilecek mekan bulunamadi.
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
                      {isLoadingMore ? 'Yukleniyor...' : 'Daha fazla yukle'}
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
