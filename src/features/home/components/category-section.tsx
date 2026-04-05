'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { CATEGORY_IDS, CATEGORY_MAP } from '@/lib/categories'

type CategoryPlace = {
  id: string
  slug: string
  name: string
  headline: string
  shortDescription: string
  categoryPrimary: string
  address: string | null
  phone: string | null
  website: string | null
  imageUrl: string | null
}


export function CategorySection() {
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [categoryPlaces, setCategoryPlaces] = useState<CategoryPlace[]>([])
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [isMobileCategoryMenuOpen, setIsMobileCategoryMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryStatus, setCategoryStatus] = useState('')

  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('tr')
  const filteredCategoryPlaces = categoryPlaces.filter((place) => {
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

  function toggleCategoryFilter(categoryId: string) {
    setActiveCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
  }

  function renderCategoryTile(categoryId: string) {
    const category = CATEGORY_MAP.get(categoryId)

    if (!category) {
      return null
    }

    const tone = CATEGORY_MAP.get(category.id)?.tone ?? 'food'
    const isActive = activeCategoryIds.includes(category.id)
    const icon = category.icon ?? '•'
    const count = categoryCounts[category.id] ?? 0

    return (
      <button
        key={category.id}
        type="button"
        className={`category-tile category-tile-${tone}${isActive ? ' is-active' : ''}`}
        onClick={() => toggleCategoryFilter(category.id)}
        aria-pressed={isActive}
      >
        <span className="category-tile-main">
          <span className="category-tile-icon" aria-hidden="true">
            {icon}
          </span>
          <span className="category-tile-separator" aria-hidden="true">
            |
          </span>
          <strong className="category-tile-label">{category.label}</strong>
          <span className="category-tile-separator" aria-hidden="true">
            |
          </span>
          <span className="category-tile-count">{count}</span>
        </span>
      </button>
    )
  }

  useEffect(() => {
    let cancelled = false

    async function loadCategoryCounts() {
      try {
        const response = await fetch('/api/place-counts', { cache: 'no-store' })
        const payload = (await response.json()) as
          | { counts?: Record<string, number>; error?: string }
          | undefined

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
        const responses = await Promise.all(
          activeCategoryIds.map((categoryId) =>
            fetch(`/api/places?category=${encodeURIComponent(categoryId)}`, {
              cache: 'no-store',
            }),
          ),
        )

        const payloads = await Promise.all(
          responses.map(async (response) => ({
            ok: response.ok,
            payload: (await response.json()) as { places?: CategoryPlace[]; error?: string },
          })),
        )

        const failedResponse = payloads.find((entry) => !entry.ok)

        if (failedResponse) {
          throw new Error(failedResponse.payload.error || 'Mekanlar yüklenemedi.')
        }

        const mergedPlaces = new Map<string, CategoryPlace>()

        for (const entry of payloads) {
          for (const place of entry.payload.places ?? []) {
            if (!mergedPlaces.has(place.id)) {
              mergedPlaces.set(place.id, place)
            }
          }
        }

        if (cancelled) {
          return
        }

        const places = Array.from(mergedPlaces.values())
        setCategoryPlaces(places)
        setCategoryStatus(
          places.length > 0
            ? `${selectedCategoryNames.join(', ')} için ${places.length} yayın kaydı bulundu.`
            : 'Seçili kategoriler için henüz yayında mekan yok.',
        )
      } catch (error) {
        if (cancelled) {
          return
        }

        setCategoryPlaces([])
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
  }, [activeCategoryIds])

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
    <section
      className="home-categories-section"
    >
      <div className="category-section-shell" id="categories">
        <div className="category-topline">
          <div>
            <h3 className="section-title">Kendi Kaş senaryonu kur! Kategorini seç!</h3>
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

        <div className="category-pill-list category-pill-list-all">
          {CATEGORY_IDS.map((categoryId) => renderCategoryTile(categoryId))}
        </div>

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
            placeholder="Kaş'da ara..."
            className="search-input"
            aria-label="Mekan ara"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button type="button" className="search-button" aria-label="Aramayı çalıştır">
            Ara
          </button>
        </div>

        <section className="category-results-shell">
          {activeCategoryIds.length > 0 ? (
            <div className="category-results-header">
              <div>
                <h4 className="category-results-title">
                  {`${activeCategoryIds.length} kategori için seçilen mekanlar`}
                </h4>
                {isCategoryLoading || filteredCategoryPlaces.length > 0 ? (
                  <p className="category-results-copy">
                    {normalizedSearchQuery && categoryPlaces.length > 0
                      ? `"${searchQuery}" için ${filteredCategoryPlaces.length} sonuç gösteriliyor.`
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
              <div className="category-results-grid">
                {filteredCategoryPlaces.map((place) => (
                  <Link key={place.id} href={`/mekan/${place.slug}`} className="category-place-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.imageUrl || CATEGORY_MAP.get(place.categoryPrimary)?.imageUrl || ''}
                      alt={place.headline || place.name}
                      className="category-place-media"
                      loading="lazy"
                    />
                    <div className="category-place-body">
                      <span className="category-place-eyebrow">
                        {CATEGORY_MAP.get(place.categoryPrimary)?.label || place.categoryPrimary}
                      </span>
                      <span className="category-place-divider" aria-hidden="true" />
                      <h5 className="category-place-title">{place.name}</h5>
                      <span className="category-place-divider" aria-hidden="true" />
                      <p className="category-place-copy">{place.shortDescription}</p>
                      <div className="category-place-signals">
                        <span
                          className={`category-place-signal${place.address ? ' is-active' : ' is-muted'}`}
                          aria-label={`Adres ${place.address ? 'mevcut' : 'yok'}`}
                          title={`Adres ${place.address ? 'mevcut' : 'yok'}`}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                            <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="9" r="2.4" fill="currentColor" />
                          </svg>
                        </span>
                        <span
                          className={`category-place-signal${place.phone ? ' is-active' : ' is-muted'}`}
                          aria-label={`Telefon ${place.phone ? 'mevcut' : 'yok'}`}
                          title={`Telefon ${place.phone ? 'mevcut' : 'yok'}`}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                            <path
                              d="M6.8 3.5h2.6c.5 0 .9.3 1 .7l.8 3.2c.1.4 0 .8-.3 1l-1.7 1.4a14.4 14.4 0 0 0 5 5l1.4-1.7c.3-.3.7-.4 1-.3l3.2.8c.5.1.8.5.8 1v2.6c0 .6-.5 1.1-1.1 1.1C10.7 19.8 4.2 13.3 4.2 4.6c0-.6.5-1.1 1.1-1.1z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span
                          className={`category-place-signal${place.website ? ' is-active' : ' is-muted'}`}
                          aria-label={`Website ${place.website ? 'mevcut' : 'yok'}`}
                          title={`Website ${place.website ? 'mevcut' : 'yok'}`}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="category-results-empty category-results-empty-centered">
              Kategorini seç! Sonuçlar burada gözükecek.
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
