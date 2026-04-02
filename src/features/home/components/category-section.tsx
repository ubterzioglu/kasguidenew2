'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { CATEGORIES } from '@/lib/supabase'

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

const CATEGORY_GROUPS = [
  {
    title: 'YEME & İÇME & KONAKLAMA',
    tone: 'food',
    ids: ['bar', 'meyhane', 'restoran', 'cafe', 'kahvalti', 'oteller'],
  },
  {
    title: 'GEZİ & KEŞİF',
    tone: 'explore',
    ids: ['tarih', 'doga', 'plaj', 'carsi', 'gezi'],
  },
  {
    title: 'AKTİVİTE & EĞLENCE',
    tone: 'fun',
    ids: ['dalis', 'aktivite', 'etkinlik'],
  },
  {
    title: 'İÇERİK & MEDYA',
    tone: 'editorial',
    ids: ['yazilar', 'roportaj', 'fotograf', 'oss', 'kas-local'],
  },
] as const

const CATEGORY_IDS = CATEGORY_GROUPS.flatMap((group) => group.ids)
const CATEGORY_MAP = new Map(CATEGORIES.map((category) => [category.id, category]))
const CATEGORY_ROW_SPLIT_INDEX = Math.ceil(CATEGORY_IDS.length / 2)
const CATEGORY_ROWS = [
  CATEGORY_IDS.slice(0, CATEGORY_ROW_SPLIT_INDEX),
  CATEGORY_IDS.slice(CATEGORY_ROW_SPLIT_INDEX),
]

function resolveCategoryTone(categoryId: string) {
  return (
    CATEGORY_GROUPS.find((group) => (group.ids as readonly string[]).includes(categoryId))?.tone ??
    'food'
  )
}

export function CategorySection() {
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([])
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
      CATEGORY_MAP.get(place.categoryPrimary)?.name ?? '',
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

    const tone = resolveCategoryTone(category.id)
    const isActive = activeCategoryIds.includes(category.id)

    return (
      <button
        key={category.id}
        type="button"
        className={`category-tile category-tile-${tone}${isActive ? ' is-active' : ''}`}
        onClick={() => toggleCategoryFilter(category.id)}
        aria-pressed={isActive}
      >
        <span className="category-tile-main">
          <strong className="category-tile-label">{category.name}</strong>
          <span className="category-tile-separator" aria-hidden="true">
            |
          </span>
        </span>
      </button>
    )
  }

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
        .map((categoryId) => CATEGORY_MAP.get(categoryId)?.name || categoryId)
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
      id="categories"
    >
      <div className="category-section-shell">
        <div className="category-topline">
          <div>
            <h3 className="section-title" style={{ fontSize: '1.2rem' }}>Kendi Kaş senaryonu kur! Kategorini seç!</h3>
          </div>
          <div className="category-topline-actions">
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

        <div className="category-pill-list category-pill-list-all" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
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
                  <span>{category.name}</span>
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
                        {CATEGORY_MAP.get(place.categoryPrimary)?.name || place.categoryPrimary}
                      </span>
                      <h5 className="category-place-title">{place.headline || place.name}</h5>
                      <p className="category-place-copy">{place.shortDescription}</p>
                      <div className="category-place-meta">
                        <span>{place.address || 'Adres bilgisi yakında'}</span>
                        {place.phone ? <span>{place.phone}</span> : null}
                        {place.website ? (
                          <span
                            onClick={(e) => {
                              e.preventDefault()
                              window.open(place.website!, '_blank', 'noopener,noreferrer')
                            }}
                            role="link"
                            tabIndex={0}
                          >
                            Website
                          </span>
                        ) : null}
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

