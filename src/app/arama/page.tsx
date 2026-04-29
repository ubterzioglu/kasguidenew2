import type { Metadata } from 'next'

import { CategoryPlaceCard } from '@/features/home/components/category-place-card'
import { getFaqItems } from '@/lib/faq-data'
import { searchPublishedPlaces } from '@/lib/public-place-store'

export const metadata: Metadata = {
  title: 'Kaş Arama Sonuçları | Kaş Guide',
  description: 'Kaş Guide içinde mekanlar ve soru-cevap içeriklerinde arama yapın.',
  alternates: { canonical: '/arama' },
}

type SearchPageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const normalizedQuery = normalizeSearchText(query)

  const [placeResults, faqItems] = await Promise.all([
    normalizedQuery ? searchPublishedPlaces({ query, limit: 24 }) : Promise.resolve([]),
    getFaqItems(),
  ])

  const faqResults = normalizedQuery
    ? faqItems.filter((item) =>
        normalizeSearchText(`${item.question} ${item.answer}`).includes(normalizedQuery),
      )
    : []

  return (
    <main className="search-page">
      <section className="search-page-hero">
        <div className="search-page-copy">
          <p className="search-page-eyebrow">Arama</p>
          <h1 className="search-page-title">Kaş içinde ne arıyorsun?</h1>
          <p className="search-page-subtitle">
            Önce mekan sonuçlarını, sonra soru-cevap arşivini ayrı bloklarda gösteriyoruz.
          </p>
        </div>

        <form action="/arama" className="search-page-form">
          <input
            type="search"
            name="q"
            defaultValue={query}
            className="search-page-input"
            placeholder="Örn. kahvaltı, plaj, havaalanı, otopark..."
            aria-label="Kaş Guide içinde ara"
          />
          <button type="submit" className="search-page-button">
            Ara
          </button>
        </form>
      </section>

      {!normalizedQuery ? (
        <section className="search-page-empty">
          <h2>Aramaya başla</h2>
          <p>Bir kelime yazdığında mekanlarda ve soru-cevap arşivinde ayrı ayrı sonuç göstereceğiz.</p>
        </section>
      ) : (
        <div className="search-page-sections">
          <section className="search-page-section">
            <div className="search-page-section-header">
              <h2>Mekanlarda Sonuçlar</h2>
              <span>{placeResults.length} sonuç</span>
            </div>

            {placeResults.length > 0 ? (
              <div className="category-results-grid search-page-place-grid">
                {placeResults.map((place) => (
                  <CategoryPlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : (
              <div className="search-page-empty">
                <h2>Mekan bulunamadı</h2>
                <p>Farklı bir kelime deneyin; isim, açıklama, adres ve kategori metinlerinde arama yapıyoruz.</p>
              </div>
            )}
          </section>

          <section className="search-page-section">
            <div className="search-page-section-header">
              <h2>Soru ve Cevaplarda Sonuçlar</h2>
              <span>{faqResults.length} sonuç</span>
            </div>

            {faqResults.length > 0 ? (
              <div className="faq-list search-page-faq-list">
                {faqResults.map((item) => (
                  <article key={item.id} className="faq-card">
                    <h3 className="faq-card-question">{item.question}</h3>
                    <p className="faq-card-answer">{item.answer}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="search-page-empty">
                <h2>SSS sonucu bulunamadı</h2>
                <p>Bu kelime soru veya cevap arşivinde görünmüyor. Daha genel bir ifade deneyebilirsiniz.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
