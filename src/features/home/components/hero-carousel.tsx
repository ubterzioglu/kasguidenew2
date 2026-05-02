'use client'

import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_HERO_SLIDES, HERO_ROTATION_MS, type HeroSlide } from '@/lib/hero-slide-data'

type HeroCarouselProps = {
  initialSlides?: HeroSlide[]
}

export function HeroCarousel({ initialSlides }: HeroCarouselProps) {
  const [activeScene, setActiveScene] = useState(0)
  const [liveSlides, setLiveSlides] = useState<HeroSlide[] | null>(null)
  const heroSlides = useMemo(
    () =>
      liveSlides && liveSlides.length > 0
        ? liveSlides
        : initialSlides && initialSlides.length > 0
          ? initialSlides
          : DEFAULT_HERO_SLIDES,
    [initialSlides, liveSlides],
  )

  const scene = heroSlides[activeScene] ?? heroSlides[0]

  const goToPreviousScene = () => {
    setActiveScene((current) => (current - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToNextScene = () => {
    setActiveScene((current) => (current + 1) % heroSlides.length)
  }

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveScene((current) => (current + 1) % heroSlides.length)
    }, HERO_ROTATION_MS)

    return () => window.clearInterval(timer)
  }, [heroSlides.length])

  useEffect(() => {
    setActiveScene((current) => (current >= heroSlides.length ? 0 : current))
  }, [heroSlides.length])

  useEffect(() => {
    const controller = new AbortController()

    async function loadLatestHeroSlides() {
      try {
        const response = await fetch('/api/hero-slides', {
          cache: 'no-store',
          signal: controller.signal,
        })

        const payload = (await response.json()) as { slides?: HeroSlide[] } | undefined

        if (!response.ok || !payload?.slides || payload.slides.length === 0) {
          return
        }

        setLiveSlides(payload.slides)
      } catch {
        // Keep server snapshot/default slides if the refresh request fails.
      }
    }

    void loadLatestHeroSlides()

    return () => controller.abort()
  }, [])

  if (!scene) {
    return null
  }

  return (
    <section className="hero" id="top">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div
          className="hero-showcase"
          style={{ backgroundImage: `url(${scene.imageUrl})` }}
          aria-label={scene.title}
        >
          <div className="hero-showcase-shade" aria-hidden="true"></div>
          <div className="hero-story-panel">
            <span className="hero-story-kicker">{scene.eyebrow || 'Kaş Guide seçkisi'}</span>
            <div className="hero-story-copy hero-story-copy-tuned hero-story-copy-simplified">
              <p className="hero-story-title">{scene.title}</p>
              <p className="hero-featured-description hero-story-description">{scene.description}</p>
              {scene.tags.length > 0 ? (
                <div className="hero-featured-meta hero-story-meta" aria-label="Hero etiketleri">
                  {scene.tags.map((tag) => (
                    <span key={`${scene.id}-${tag}`} className="hero-meta-chip hero-meta-chip-accent">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="hero-carousel-controls">
            <button
              type="button"
              className="hero-carousel-arrow"
              onClick={goToPreviousScene}
              aria-label="Önceki sahne"
            >
              ‹
            </button>

            <div className="hero-carousel-dots" aria-label="Hero sahneleri">
              {heroSlides.map((heroScene, index) => (
                <button
                  key={heroScene.id}
                  type="button"
                  className={`hero-carousel-dot${index === activeScene ? ' active' : ''}`}
                  onClick={() => setActiveScene(index)}
                  aria-label={`Sahne ${index + 1}`}
                  aria-pressed={index === activeScene}
                ></button>
              ))}
            </div>

            <button
              type="button"
              className="hero-carousel-arrow"
              onClick={goToNextScene}
              aria-label="Sonraki sahne"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
