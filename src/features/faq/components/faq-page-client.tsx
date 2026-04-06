'use client'

import { useMemo, useState } from 'react'

import type { FaqItem } from '@/lib/faq-data'

type FaqPageClientProps = {
  items: FaqItem[]
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function FaqPageClient({ items }: FaqPageClientProps) {
  const [query, setQuery] = useState('')

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim())

    if (!normalizedQuery) {
      return items
    }

    return items.filter((item) => {
      const haystack = normalizeSearchText(`${item.question} ${item.answer}`)
      return haystack.includes(normalizedQuery)
    })
  }, [items, query])

  return (
    <main className="faq-page">
      <section className="faq-hero">
        <div className="faq-hero-copy">
          <p className="faq-eyebrow">SSS</p>
          <h1 className="faq-title">Kaş Hakkında Sık Sorulan Sorular</h1>
          <p className="faq-subtitle">
            Eski FAQ arşivindeki tüm içerik şimdi tek bir arama kutusuyla erişilebilir. Sorularda ve cevaplarda anında filtreleme yapabilirsiniz.
          </p>
        </div>
        <div className="faq-stats" aria-label="FAQ istatistikleri">
          <article className="faq-stat-card">
            <strong>{items.length}</strong>
            <span>Toplam soru</span>
          </article>
          <article className="faq-stat-card">
            <strong>{filteredItems.length}</strong>
            <span>Gösterilen sonuç</span>
          </article>
        </div>
      </section>

      <section className="faq-search-panel">
        <label className="faq-search-label" htmlFor="faq-search">
          Aradığınız şeyi yazın
        </label>
        <input
          id="faq-search"
          type="search"
          className="faq-search-input"
          placeholder="Örn. Kaş'a ne zaman gidilir, havaalanı, plaj, otopark..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      <section className="faq-list" aria-live="polite">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <article key={item.id} className="faq-card">
              <h2 className="faq-card-question">{item.question}</h2>
              <p className="faq-card-answer">{item.answer}</p>
            </article>
          ))
        ) : (
          <div className="faq-empty-state">
            <h2>Sonuç bulunamadı</h2>
            <p>Farklı bir anahtar kelime deneyin. Arama hem soru metninde hem cevapta çalışır.</p>
          </div>
        )}
      </section>
    </main>
  )
}
