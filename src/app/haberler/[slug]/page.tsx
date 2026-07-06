import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'
import { getNewsBySlug } from '@/lib/updates-store'
import type { NewsItem } from '@/types/updates'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

function buildNewsArticleJsonLd(news: NewsItem, slug: string): Record<string, unknown> {
  const url = `https://www.kasguide.de/haberler/${slug}`
  const image = news.imageUrl || 'https://www.kasguide.de/kasplaceholder.jpg'

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.summary,
    image,
    url,
    datePublished: news.publishedAt ?? news.createdAt,
    dateModified: news.updatedAt,
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
  const news = await getNewsBySlug(slug).catch((error) => {
    console.error('[HaberDetayPage] News metadata could not be loaded.', error)
    return null
  })

  if (!news) {
    return {
      title: 'Haber bulunamadi | Kaş Guide',
    }
  }

  const title = `${news.title} | Kaş Guide`
  const url = `https://www.kasguide.de/haberler/${slug}`

  return {
    title,
    description: news.summary,
    alternates: { canonical: `/haberler/${slug}` },
    openGraph: {
      title,
      description: news.summary,
      url,
      siteName: 'Kaş Guide',
      locale: 'tr_TR',
      type: 'article',
      publishedTime: news.publishedAt ?? news.createdAt,
      modifiedTime: news.updatedAt,
      ...(news.imageUrl ? { images: [{ url: news.imageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: news.summary,
      ...(news.imageUrl ? { images: [news.imageUrl] } : {}),
    },
  }
}

export default async function HaberDetayPage({ params }: PageProps) {
  const { slug } = await params
  const news = await getNewsBySlug(slug).catch((error) => {
    console.error('[HaberDetayPage] News detail could not be loaded.', error)
    return null
  })

  if (!news) {
    notFound()
  }

  const newsArticleJsonLd = buildNewsArticleJsonLd(news, slug)
  const breadcrumbJsonLd = buildBreadcrumbListSchema(news.title, `https://www.kasguide.de/haberler/${slug}`)

  return (
    <main className="updates-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="updates-detail-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={news.imageUrl || '/kasplaceholder.jpg'} alt={news.title} className="updates-detail-image" />
        <div className="updates-detail-copy">
          <span className="updates-detail-badge">Haber</span>
          <h1>{news.title}</h1>
          <p className="updates-detail-summary">{news.summary}</p>
          <div className="updates-detail-content">
            {news.content.split('\n\n').map((paragraph, index) => (
              <p key={`${news.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}