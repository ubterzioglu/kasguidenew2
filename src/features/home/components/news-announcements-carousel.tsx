'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { UpdateCarouselItem } from '@/types/updates'

const AUTO_ROTATION_MS = 4800
const MANUAL_PAUSE_MS = 9000
const DEFAULT_IMAGE = '/kasplaceholder.jpg'

type Props = {
  items: UpdateCarouselItem[]
}

function getVisibleCount(width: number) {
  if (width < 768) {
    return 1
  }

  if (width < 1100) {
    return 2
  }

  return 3
}

export function NewsAnnouncementsCarousel({ items }: Props) {
  const [activePage, setActivePage] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const pauseTimerRef = useRef<number | null>(null)
  const touchStartRef = useRef<number | null>(null)

  const pages = useMemo(() => {
    const pageSize = Math.max(1, visibleCount)
    const nextPages: UpdateCarouselItem[][] = []

    for (let index = 0; index < items.length; index += pageSize) {
      nextPages.push(items.slice(index, index + pageSize))
    }

    return nextPages
  }, [items, visibleCount])

  useEffect(() => {
    const syncVisibleCount = () => {
      setVisibleCount(getVisibleCount(window.innerWidth))
    }

    syncVisibleCount()
    window.addEventListener('resize', syncVisibleCount)

    return () => window.removeEventListener('resize', syncVisibleCount)
  }, [])

  useEffect(() => {
    setActivePage((current) => (current >= pages.length ? 0 : current))
  }, [pages.length])

  useEffect(() => {
    if (pages.length <= 1 || isPaused) {
      return
    }

    const timer = window.setInterval(() => {
      setActivePage((current) => (current + 1) % pages.length)
    }, AUTO_ROTATION_MS)

    return () => window.clearInterval(timer)
  }, [isPaused, pages.length])

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        window.clearTimeout(pauseTimerRef.current)
      }
    }
  }, [])

  const pauseAutoplay = () => {
    setIsPaused(true)

    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current)
    }

    pauseTimerRef.current = window.setTimeout(() => {
      setIsPaused(false)
      pauseTimerRef.current = null
    }, MANUAL_PAUSE_MS)
  }

  const goToPage = (nextPage: number) => {
    if (pages.length === 0) {
      return
    }

    pauseAutoplay()
    setActivePage((nextPage + pages.length) % pages.length)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <section
      className="updates-section"
      aria-label="Haberler ve duyurular"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!pauseTimerRef.current) {
          setIsPaused(false)
        }
      }}
      onTouchStart={(event) => {
        touchStartRef.current = event.changedTouches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        const start = touchStartRef.current
        const end = event.changedTouches[0]?.clientX ?? null

        if (start === null || end === null) {
          return
        }

        const delta = end - start
        if (Math.abs(delta) < 50) {
          return
        }

        if (delta < 0) {
          goToPage(activePage + 1)
        } else {
          goToPage(activePage - 1)
        }
      }}
    >
      <div className="updates-section-header">
        <div>
          <p className="updates-section-eyebrow">Güncel</p>
          <h2 className="updates-section-title">Haberler ve Duyurular</h2>
        </div>
        <Link href="/haberler" className="updates-section-link">
          Tümünü Gör
        </Link>
      </div>

      <div className="updates-carousel-shell">
        <div className="updates-carousel-viewport">
          <div
            className="updates-carousel-track"
            aria-live="polite"
            style={{ transform: `translateX(-${activePage * 100}%)` }}
          >
            {pages.map((pageItems, pageIndex) => (
              <div
                key={`updates-page-${pageIndex}`}
                className={`updates-carousel-page updates-carousel-page-${visibleCount}`}
              >
                {pageItems.map((item) => (
                  <Link key={item.id} href={item.href} className="updates-card">
                    <div className="updates-card-media-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || DEFAULT_IMAGE}
                        alt={item.title || 'Güncel içerik görseli'}
                        className="updates-card-media"
                        loading="lazy"
                      />
                      <span className={`updates-card-badge updates-card-badge-${item.type}`}>
                        {item.badgeLabel}
                      </span>
                    </div>
                    <div className="updates-card-copy">
                      <span className="updates-card-date">{item.dateLabel}</span>
                      <h3 className="updates-card-title">{item.title}</h3>
                      <p className="updates-card-summary">{item.summary}</p>
                      <span className="updates-card-cta">Detayı Gör</span>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {pages.length > 1 ? (
          <>
            <div className="updates-carousel-arrows" aria-hidden="true">
              <button
                type="button"
                className="updates-carousel-arrow"
                onClick={() => goToPage(activePage - 1)}
                aria-label="Onceki kartlar"
              >
                ‹
              </button>
              <button
                type="button"
                className="updates-carousel-arrow"
                onClick={() => goToPage(activePage + 1)}
                aria-label="Sonraki kartlar"
              >
                ›
              </button>
            </div>

            <div className="updates-carousel-footer">
              <div className="updates-carousel-dots" aria-label="Carousel sayfalari">
                {pages.map((_, pageIndex) => (
                  <button
                    key={`updates-dot-${pageIndex}`}
                    type="button"
                    className={`updates-carousel-dot${pageIndex === activePage ? ' is-active' : ''}`}
                    onClick={() => goToPage(pageIndex)}
                    aria-label={`Sayfa ${pageIndex + 1}`}
                    aria-pressed={pageIndex === activePage}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}