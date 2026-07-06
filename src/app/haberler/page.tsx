import type { Metadata } from 'next'
import Link from 'next/link'

import { listPublicNews } from '@/lib/updates-store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Haberler | Kaş Guide',
  description: 'Kaş Guide haberleri, yeni içerikler ve güncel gelişmeler.',
  alternates: { canonical: '/haberler' },
  openGraph: {
    title: 'Haberler | Kaş Guide',
    description: 'Kaş Guide haberleri, yeni içerikler ve güncel gelişmeler.',
    url: '/haberler',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function HaberlerPage() {
  const news = await listPublicNews(100).catch((error) => {
    console.error('[HaberlerPage] News list could not be loaded.', error)
    return []
  })

  return (
    <main className="updates-page">
      <section className="updates-page-hero">
        <p className="updates-page-eyebrow">Haberler</p>
        <h1 className="updates-page-title">Kaş Guide Haberleri</h1>
        <p className="updates-page-description">
          Yeni rotalar, taze içerikler ve Kaş Guide tarafındaki güncellemeleri tek yerde topla.
        </p>
      </section>

      <section className="updates-list-shell">
        {news.length === 0 ? (
          <div className="updates-empty-state">
            <strong>Henüz yayınlanmış haber yok.</strong>
            <p>Yeni içerikler hazır oldukça bu alanda görünecek.</p>
          </div>
        ) : (
          <div className="updates-list-grid">
            {news.map((item) => (
              <Link key={item.id} href={`/haberler/${item.slug}`} className="updates-list-card">
                <img src={item.imageUrl || '/kasplaceholder.jpg'} alt={item.title} className="updates-list-image" width={600} height={400} loading="lazy" />
                <div className="updates-list-copy">
                  <span className="updates-list-type">Haber</span>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}