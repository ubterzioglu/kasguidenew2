import type { Metadata } from 'next'
import Link from 'next/link'

import { listPublicAnnouncements } from '@/lib/updates-store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Duyurular | Kaş Guide',
  description: 'Kaş Guide duyuruları, önemli notlar ve süreli bilgilendirmeler.',
}

export default async function DuyurularPage() {
  const announcements = await listPublicAnnouncements(100).catch((error) => {
    console.error('[DuyurularPage] Announcement list could not be loaded.', error)
    return []
  })

  return (
    <main className="updates-page">
      <section className="updates-page-hero updates-page-hero-announcements">
        <p className="updates-page-eyebrow">Duyurular</p>
        <h1 className="updates-page-title">Güncel Duyurular</h1>
        <p className="updates-page-description">
          Süreli bilgilendirmeler, acil notlar ve takip edilmesi gereken güncellemeler burada.
        </p>
      </section>

      <section className="updates-list-shell">
        {announcements.length === 0 ? (
          <div className="updates-empty-state">
            <strong>Yayında duyuru bulunmuyor.</strong>
            <p>Yeni duyurular eklendiğinde burada listelenecek.</p>
          </div>
        ) : (
          <div className="updates-list-grid">
            {announcements.map((item) => (
              <Link key={item.id} href={`/duyurular/${item.slug}`} className="updates-list-card updates-list-card-announcement">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl || '/kasplaceholder.jpg'} alt={item.title} className="updates-list-image" />
                <div className="updates-list-copy">
                  <span className={`updates-list-type updates-list-type-${item.priority}`}>Duyuru</span>
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