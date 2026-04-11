import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getNewsBySlug } from '@/lib/updates-store'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const news = await getNewsBySlug(slug)

  if (!news) {
    return {
      title: 'Haber bulunamadi | Kaş Guide',
    }
  }

  return {
    title: `${news.title} | Kaş Guide`,
    description: news.summary,
  }
}

export default async function HaberDetayPage({ params }: PageProps) {
  const { slug } = await params
  const news = await getNewsBySlug(slug)

  if (!news) {
    notFound()
  }

  return (
    <main className="updates-detail-page">
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