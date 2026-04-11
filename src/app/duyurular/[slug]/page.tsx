import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAnnouncementBySlug } from '@/lib/updates-store'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const announcement = await getAnnouncementBySlug(slug).catch((error) => {
    console.error('[DuyuruDetayPage] Announcement metadata could not be loaded.', error)
    return null
  })

  if (!announcement) {
    return {
      title: 'Duyuru bulunamadı | Kaş Guide',
    }
  }

  return {
    title: `${announcement.title} | Kaş Guide`,
    description: announcement.summary,
  }
}

export default async function DuyuruDetayPage({ params }: PageProps) {
  const { slug } = await params
  const announcement = await getAnnouncementBySlug(slug).catch((error) => {
    console.error('[DuyuruDetayPage] Announcement detail could not be loaded.', error)
    return null
  })

  if (!announcement) {
    notFound()
  }

  return (
    <main className="updates-detail-page">
      <article className="updates-detail-card updates-detail-card-announcement">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={announcement.imageUrl || '/kasplaceholder.jpg'} alt={announcement.title} className="updates-detail-image" />
        <div className="updates-detail-copy">
          <span className={`updates-detail-badge updates-detail-badge-${announcement.priority}`}>Duyuru</span>
          <h1>{announcement.title}</h1>
          <p className="updates-detail-summary">{announcement.summary}</p>
          <div className="updates-detail-content">
            {announcement.content.split('\n\n').map((paragraph, index) => (
              <p key={`${announcement.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}