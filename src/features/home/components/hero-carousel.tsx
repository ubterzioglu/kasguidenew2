'use client'

import { useEffect, useState } from 'react'

import { DEFAULT_HERO_SLIDES, HERO_ROTATION_MS, type HeroSlide } from '@/lib/hero-slide-data'

type WeatherSnapshot = {
  dateLabel: string
  temperature: number
  apparentTemperature: number
  windSpeed: number
  minTemperature: number
  maxTemperature: number
  condition: string
  sunrise: string
  sunset: string
  uvIndex: number
}

const DEFAULT_WEATHER: WeatherSnapshot = {
  dateLabel: 'Kas icin bugun',
  temperature: 24,
  apparentTemperature: 25,
  windSpeed: 12,
  minTemperature: 19,
  maxTemperature: 27,
  condition: 'Acik',
  sunrise: '06:32',
  sunset: '19:21',
  uvIndex: 5,
}

export function HeroCarousel() {
  const [activeScene, setActiveScene] = useState(0)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES)
  const [weather, setWeather] = useState<WeatherSnapshot>(DEFAULT_WEATHER)

  const scene = heroSlides[activeScene] ?? heroSlides[0]

  useEffect(() => {
    let isMounted = true

    async function loadHeroSlides() {
      try {
        const response = await fetch('/api/hero-slides', { cache: 'no-store' })
        const payload = (await response.json()) as { slides?: HeroSlide[] } | undefined

        if (!response.ok || !payload?.slides?.length) {
          return
        }

        if (isMounted) {
          setHeroSlides(payload.slides)
        }
      } catch {
        // Seed slides remain in place when the API is unavailable.
      }
    }

    void loadHeroSlides()

    return () => {
      isMounted = false
    }
  }, [])

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
    let isMounted = true

    async function loadWeather() {
      try {
        const response = await fetch('/api/hero-insights', { cache: 'no-store' })
        const payload = (await response.json()) as
          | {
              dateLabel?: string
              temperature?: number
              apparentTemperature?: number
              windSpeed?: number
              minTemperature?: number
              maxTemperature?: number
              condition?: string
              sunrise?: string
              sunset?: string
              uvIndex?: number
            }
          | undefined

        if (!response.ok || !payload) {
          return
        }

        if (isMounted) {
          setWeather({
            dateLabel: payload.dateLabel ?? DEFAULT_WEATHER.dateLabel,
            temperature: Math.round(payload.temperature ?? DEFAULT_WEATHER.temperature),
            apparentTemperature: Math.round(payload.apparentTemperature ?? DEFAULT_WEATHER.apparentTemperature),
            windSpeed: Math.round(payload.windSpeed ?? DEFAULT_WEATHER.windSpeed),
            minTemperature: Math.round(payload.minTemperature ?? DEFAULT_WEATHER.minTemperature),
            maxTemperature: Math.round(payload.maxTemperature ?? DEFAULT_WEATHER.maxTemperature),
            condition: payload.condition ?? DEFAULT_WEATHER.condition,
            sunrise: payload.sunrise ?? DEFAULT_WEATHER.sunrise,
            sunset: payload.sunset ?? DEFAULT_WEATHER.sunset,
            uvIndex: Math.round(payload.uvIndex ?? DEFAULT_WEATHER.uvIndex),
          })
        }
      } catch {
        // Keep fallback weather when API is unavailable.
      }
    }

    void loadWeather()

    return () => {
      isMounted = false
    }
  }, [])

  if (!scene) {
    return null
  }

  return (
    <section className="hero" id="top">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div
          className="hero-story-grid hero-story-grid-media"
          style={{ backgroundImage: `url(${scene.imageUrl})` }}
        >
          <div className="hero-featured-card hero-carousel-card hero-story-card hero-story-featured-pane">
            <div className="hero-featured-copy hero-carousel-copy hero-story-copy-tuned">
              <h1 className="hero-story-title">
                <span className="hero-story-title-line">Kas'i Bir Turist Gibi Degil,</span>
                <br />
                <span className="hero-story-title-line">Bir Yerlisi Gibi Yasa.</span>
              </h1>
              <p className="hero-featured-description hero-story-description">
                En gizli koylar, en lezzetli mezeler ve sadece mudavimlerin bildigi rotalar.
                Kas'in dijital anahtari elinde.
              </p>

              <div className="hero-featured-actions">
                <a href="#categories" className="hero-primary-action">
                  Tatilimi planla!
                </a>
                <a href="#routes" className="hero-secondary-action">
                  Ben Yerlisiyim!
                </a>
              </div>
            </div>

            <div className="hero-carousel-controls">
              <div className="hero-carousel-nav">
                <button
                  type="button"
                  className="hero-carousel-arrow"
                  onClick={() => setActiveScene((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Onceki sahne"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="hero-carousel-arrow"
                  onClick={() => setActiveScene((current) => (current + 1) % heroSlides.length)}
                  aria-label="Sonraki sahne"
                >
                  ›
                </button>
              </div>

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
            </div>
          </div>

          <aside className="hero-story-aside">
            <div className="hero-insight-card hero-insight-card-proof">
              <div className="hero-insight-header hero-insight-header-accent">
                <h2 className="hero-insight-title">{weather.dateLabel}</h2>
              </div>
              <div className="hero-weather-panel" aria-label="Bugunku hava durumu">
                <div className="hero-weather-main">
                  <strong className="hero-weather-temp">{weather.temperature}°</strong>
                  <span className="hero-weather-condition">{weather.condition}</span>
                </div>
                <div className="hero-weather-meta">
                  <span>Hissedilen {weather.apparentTemperature}°</span>
                  <span>Ruzgar {weather.windSpeed} km/s</span>
                  <span>Min {weather.minTemperature}° / Max {weather.maxTemperature}°</span>
                  <span>Gunes {weather.sunrise} / {weather.sunset}</span>
                  <span>UV {weather.uvIndex}</span>
                </div>
              </div>
            </div>

            <div className="hero-insight-card hero-insight-card-weather">
              <div className="hero-insight-header hero-insight-header-accent">
                <h2 className="hero-insight-title">One Cikan Mekanlar</h2>
              </div>
              <div className="hero-signal-row">
                <strong>Bi'Lokma</strong>
                <span>Anne yemekleri ve vegan secenekler</span>
              </div>
              <div className="hero-signal-row">
                <strong>Zaika</strong>
                <span>Ocakbasi ve geleneksel lezzetler</span>
              </div>
            </div>

            <div className="hero-insight-card hero-insight-card-cta">
              <div className="hero-insight-header hero-insight-header-accent">
                <h2 className="hero-insight-title">Topluluga gir</h2>
              </div>
              <p>
                Guncel etkinlikler, son dakika tavsiyeleri icin topluluga katil!
              </p>
              <a
                href="https://chat.whatsapp.com/GODQNmpRlAaDDtyaDnIyn4"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-aside-link hero-aside-link-cta"
              >
                WhatsApp Toplulugu
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
