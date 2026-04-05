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
  dateLabel: '5 Nisan Pazar',
  temperature: 24,
  apparentTemperature: 25,
  windSpeed: 12,
  minTemperature: 19,
  maxTemperature: 27,
  condition: 'Açık',
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
                <span className="hero-story-title-line">Kaş'ı Bir Turist Gibi Değil,</span>
                <br />
                <span className="hero-story-title-line">Bir Yerlisi Gibi Yaşa.</span>
              </h1>
              <p className="hero-featured-description hero-story-description">
                En gizli koylar, en lezzetli mezeler ve sadece müdavimlerin bildiği rotalar.
                Kaş'ın dijital anahtarı elinde.
              </p>

              <div className="hero-featured-actions">
                <a href="#categories" className="hero-primary-action">
                  Tatilimi planla!
                </a>
                <a href="#routes" className="hero-primary-action">
                  Ben Yerlisiyim!
                </a>
                <a
                  href="https://chat.whatsapp.com/GODQNmpRlAaDDtyaDnIyn4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-primary-action"
                >
                  WhatsApp Topluluğu
                </a>
              </div>
            </div>

            <div className="hero-carousel-controls">
              <div className="hero-carousel-nav">
                <button
                  type="button"
                  className="hero-carousel-arrow"
                  onClick={() => setActiveScene((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Önceki sahne"
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
                <h2 className="hero-insight-title">Kaş için bugün</h2>
              </div>
              <div className="hero-weather-panel" aria-label="Bugünkü hava durumu">
                <span className="hero-weather-date">{weather.dateLabel}</span>
                <div className="hero-weather-main">
                  <strong className="hero-weather-temp">{weather.temperature}°</strong>
                  <span className="hero-weather-condition">{weather.condition}</span>
                </div>
                <div className="hero-weather-meta">
                  <span>Hissedilen {weather.apparentTemperature}°</span>
                  <span>Rüzgar {weather.windSpeed} km/s</span>
                  <span>Min {weather.minTemperature}° / Max {weather.maxTemperature}°</span>
                  <span>Güneş {weather.sunrise} / {weather.sunset}</span>
                  <span>UV {weather.uvIndex}</span>
                </div>
              </div>
            </div>

            <div className="hero-insight-card hero-insight-card-weather">
              <div className="hero-insight-header hero-insight-header-accent">
                <h2 className="hero-insight-title">Öne Çıkan Mekanlar</h2>
              </div>
              <div className="hero-signal-row">
                <strong>Bi'Lokma</strong>
                <span>Anne yemekleri ve vegan seçenekler</span>
              </div>
              <div className="hero-signal-row">
                <strong>Zaika</strong>
                <span>Ocakbaşı ve geleneksel lezzetler</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
