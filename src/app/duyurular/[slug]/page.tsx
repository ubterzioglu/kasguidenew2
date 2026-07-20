import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'
import { getRandomNewsImage } from '@/lib/random-image'
import { getAnnouncementBySlug } from '@/lib/updates-store'
import type { AnnouncementItem } from '@/types/updates'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

function buildAnnouncementArticleJsonLd(announcement: AnnouncementItem, slug: string): Record<string, unknown> {
  const url = `https://www.kasguide.de/duyurular/${slug}`
  const image = announcement.imageUrl || `https://www.kasguide.de${getRandomNewsImage(announcement.id)}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: announcement.title,
    description: announcement.summary,
    image,
    url,
    datePublished: announcement.publishedAt ?? announcement.createdAt,
    dateModified: announcement.updatedAt,
    author: { '@type': 'Organization', name: 'Kaş Guide' },
    publisher: {
      '@type': 'Organization',
      name: 'Kaş Guide',
      logo: { '@type': 'ImageObject', url: 'https://www.kasguide.de/logo.png' },
    },
  }
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

  const title = `${announcement.title} | Kaş Guide`
  const url = `https://www.kasguide.de/duyurular/${slug}`

  return {
    title,
    description: announcement.summary,
    alternates: { canonical: `/duyurular/${slug}` },
    openGraph: {
      title,
      description: announcement.summary,
      url,
      siteName: 'Kaş Guide',
      locale: 'tr_TR',
      type: 'article',
      publishedTime: announcement.publishedAt ?? announcement.createdAt,
      modifiedTime: announcement.updatedAt,
      ...(announcement.imageUrl ? { images: [{ url: announcement.imageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: announcement.summary,
      ...(announcement.imageUrl ? { images: [announcement.imageUrl] } : {}),
    },
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

  const announcementJsonLd = buildAnnouncementArticleJsonLd(announcement, slug)
  const breadcrumbJsonLd = buildBreadcrumbListSchema(announcement.title, `https://www.kasguide.de/duyurular/${slug}`)

  return (
    <main className="updates-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(announcementJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="updates-detail-card updates-detail-card-announcement">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={announcement.imageUrl || getRandomNewsImage(announcement.id)} alt={announcement.title} className="updates-detail-image" />
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