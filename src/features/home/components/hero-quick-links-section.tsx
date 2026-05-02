'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

export function HeroQuickLinksSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function submitSearch() {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      router.push('/arama')
      return
    }

    router.push(`/arama?q=${encodeURIComponent(normalizedQuery)}`)
  }

  return (
    <section className="hero-quick-links-section" aria-label="Kaş Guide hızlı arama alanı">
      <div className="hero-quick-links-shell hero-search-band-shell">
        <div className="hero-search-band-form" role="search" aria-label="Kaş Guide içinde arama">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submitSearch()
              }
            }}
            className="hero-search-band-input"
            placeholder="Kaş'ta ara: mekan adı, plaj, dalış, kahvaltı..."
            aria-label="Kaş Guide arama kelimesi"
          />
          <button type="button" className="hero-search-band-button" onClick={submitSearch}>
            Ara
          </button>
        </div>
      </div>
    </section>
  )
}
