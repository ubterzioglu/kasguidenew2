'use client'

import { useEffect, useState } from 'react'

import { DEFAULT_HERO_SLIDES, HERO_ROTATION_MS, type HeroSlide } from '@/lib/hero-slide-data'

type WeatherSnapshot = {
  temperature: number
  apparentTemperature: number
  windSpeed: number
  minTemperature: number
  maxTemperature: number
  condition: string
}

const DEFAULT_WEATHER: WeatherSnapshot = {
  temperature: 24,
  apparentTemperature: 25,
  windSpeed: 12,
  minTemperature: 19,
  maxTemperature: 27,
  condition: 'Açık',
}

function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'Açık'
  if (code <= 3) return 'Parçalı bulutlu'
  if (code <= 48) return 'Sisli'
  if (code <= 57) return 'Çisenti'
  if (code <= 67) return 'Yağmurlu'
  if (code <= 77) return 'Karlı'
  if (code <= 82) return 'Sağanak'
  if (code <= 99) return 'Fırtınalı'
  return 'Güncel'
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
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=36.2018&longitude=29.6377&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FIstanbul&forecast_days=1',
          { cache: 'no-store' },
        )
        const payload = (await response.json()) as
          | {
              current?: {
                temperature_2m?: number
                apparent_temperature?: number
                weather_code?: number
                wind_speed_10m?: number
              }
              daily?: {
                temperature_2m_min?: number[]
                temperature_2m_max?: number[]
              }
            }
          | undefined

        if (!response.ok || !payload?.current) {
          return
        }

        if (isMounted) {
          setWeather({
            temperature: Math.round(payload.current.temperature_2m ?? DEFAULT_WEATHER.temperature),
            apparentTemperature: Math.round(
              payload.current.apparent_temperature ?? DEFAULT_WEATHER.apparentTemperature,
            ),
            windSpeed: Math.round(payload.current.wind_speed_10m ?? DEFAULT_WEATHER.windSpeed),
            minTemperature: Math.round(
              payload.daily?.temperature_2m_min?.[0] ?? DEFAULT_WEATHER.minTemperature,
            ),
            maxTemperature: Math.round(
              payload.daily?.temperature_2m_max?.[0] ?? DEFAULT_WEATHER.maxTemperature,
            ),
            condition: weatherCodeToLabel(payload.current.weather_code ?? 0),
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
                <span className="hero-story-title-line">Kaş&apos;ı Bir Turist Gibi Değil,</span>
                <br />
                <span className="hero-story-title-line">Bir Yerlisi Gibi Yaşa.</span>
              </h1>
              <p className="hero-featured-description hero-story-description">
                En gizli koylar, en lezzetli mezeler ve sadece müdavimlerin bildiği rotalar.
                Kaş&apos;ın dijital anahtarı elinde.
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
                  onClick={() =>
                    setActiveScene(
                      (current) => (current - 1 + heroSlides.length) % heroSlides.length,
                    )
                  }
                  aria-label="Önceki sahne"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="hero-carousel-arrow"
                  onClick={() =>
                    setActiveScene((current) => (current + 1) % heroSlides.length)
                  }
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
                <h2 className="hero-insight-title">2 Nisan Çarşamba</h2>
              </div>
              <div className="hero-weather-panel" aria-label="Bugünkü hava durumu">
                <div className="hero-weather-main">
                  <strong className="hero-weather-temp">{weather.temperature}°</strong>
                  <span className="hero-weather-condition">{weather.condition}</span>
                </div>
                <div className="hero-weather-meta">
                  <span>Hissedilen {weather.apparentTemperature}°</span>
                  <span>Rüzgar {weather.windSpeed} km/s</span>
                  <span>
                    Min {weather.minTemperature}° / Max {weather.maxTemperature}°
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-insight-card hero-insight-card-weather">
              <div className="hero-insight-header hero-insight-header-accent">
                <h2 className="hero-insight-title">Öne Çıkan Mekanlar</h2>
              </div>
              {/* TODO: Fetch featured venues from the database */}
              <div className="hero-signal-row">
                <strong>Bi'Lokma</strong>
                <span>Anne yemekleri ve vegan seçenekler</span>
              </div>
              <div className="hero-signal-row">
                <strong>Zaika</strong>
                <span>Ocakbaşı ve geleneksel lezzetler</span>
              </div>
            </div>

            <div className="hero-insight-card hero-insight-card-cta">
              <div className="hero-insight-header hero-insight-header-accent">
                <h2 className="hero-insight-title">Topluluğa gir</h2>
              </div>
              <p>
                Güncel etkinlikler, son dakika tavsiyeleri için topluluğa katıl!
              </p>
              <a
                href="https://chat.whatsapp.com/GODQNmpRlAaDDtyaDnIyn4"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-aside-link hero-aside-link-cta"
              >
                WhatsApp Topluluğu
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
