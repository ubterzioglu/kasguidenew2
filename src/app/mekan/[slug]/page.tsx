import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPlaceCategoryLabel } from '@/lib/place-taxonomy'
import { getPublishedPlaceBySlug } from '@/lib/public-place-store'
import { PlaceDetailGallery } from './place-detail-gallery'

export const revalidate = 3600 // 1 hour caching

type DetailSignalKey = 'address' | 'phone' | 'website'
type CategoryBadgeMap = Record<string, string[]>

const CATEGORY_BADGES: CategoryBadgeMap = {
  bar: ['Kas Guide Onerir', 'Aksam Baslangici'],
  meyhane: ['Kas Guide Onerir', 'Yerel Favori'],
  restoran: ['Kas Guide Onerir', 'Tekrar Gidilir'],
  cafe: ['Kas Guide Onerir', 'Gun Icine Uygun'],
  kahvalti: ['Kas Guide Onerir', 'Sabah Ruhu'],
  plaj: ['Kas Guide Onerir', 'Kas Ruhu Var'],
  oteller: ['Kas Guide Onerir', 'Konfor Noktasi'],
  dalis: ['Kas Guide Onerir', 'Deniz Rotasi'],
  aktivite: ['Kas Guide Onerir', 'Deneyim Odakli'],
  gezi: ['Kas Guide Onerir', 'Kesif Noktasi'],
  carsi: ['Kas Guide Onerir', 'Yerel Rota'],
}

function renderDetailSignalIcon(key: DetailSignalKey) {
  if (key === 'address') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="9" r="2.4" fill="currentColor" />
      </svg>
    )
  }

  if (key === 'phone') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M6.8 3.5h2.6c.5 0 .9.3 1 .7l.8 3.2c.1.4 0 .8-.3 1l-1.7 1.4a14.4 14.4 0 0 0 5 5l1.4-1.7c.3-.3.7-.4 1-.3l3.2.8c.5.1.8.5.8 1v2.6c0 .6-.5 1.1-1.1 1.1C10.7 19.8 4.2 13.3 4.2 4.6c0-.6.5-1.1 1.1-1.1z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function getGuideBadges(categoryPrimary: string) {
  return CATEGORY_BADGES[categoryPrimary] ?? ['Kas Guide Onerir']
}

type PlaceDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PlaceDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const place = await getPublishedPlaceBySlug(slug)

  if (!place) {
    return {
      title: 'Mekan Bulunamadı | Kaş Guide',
    }
  }

  const title = `${place.headline} | Kaş Guide`
  const description = place.shortDescription
  const image = place.imageUrls[0] ?? null

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://kasguide.de/mekan/${slug}`,
      siteName: 'Kaş Guide',
      locale: 'tr_TR',
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const { slug } = await params
  const place = await getPublishedPlaceBySlug(slug)

  if (!place) {
    notFound()
  }

  const heroImage =
    place.imageUrls[0] ||
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80'
  const gallery = place.imageUrls.slice(1, 5)
  const categoryClassLabel = getPlaceCategoryLabel(place.categoryPrimary)
  const guideBadges = getGuideBadges(place.categoryPrimary)
  const detailSignals = [
    {
      key: 'address',
      active: Boolean(place.address),
    },
    {
      key: 'phone',
      active: Boolean(place.phone),
    },
    {
      key: 'website',
      active: Boolean(place.website),
    },
  ] as const satisfies Array<{ key: DetailSignalKey; active: boolean }>

  return (
    <main className="place-detail-page">
      <section className="place-detail-shell">
        <div className="place-detail-top-grid">
          <section className="place-detail-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt={place.name} className="place-detail-hero-media" fetchPriority="high" loading="eager" />
            <div className="place-detail-hero-shade" />
            <div className="place-detail-hero-copy">
              <h1 className="place-detail-title place-detail-title-name">{place.name}</h1>
              <p className="place-detail-intro">{place.headline}</p>
              <span className="place-detail-hero-category">{getPlaceCategoryLabel(place.categoryPrimary)}</span>
            </div>
          </section>
        </div>

        <section className="place-detail-status-card">
          <div className="place-detail-status-row">
            <div className="place-detail-status-grid">
              {detailSignals.map((signal) => (
                signal.key === 'website' && place.website ? (
                  <a
                    key={signal.key}
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`place-detail-status-item place-detail-status-item-link${signal.active ? ' is-active' : ' is-muted'}`}
                    aria-label="Website mevcut"
                    title="Website mevcut"
                  >
                    <span className="place-detail-status-icon" aria-hidden="true">
                      {renderDetailSignalIcon(signal.key)}
                    </span>
                  </a>
                ) : (
                  <article
                    key={signal.key}
                    className={`place-detail-status-item${signal.active ? ' is-active' : ' is-muted'}`}
                    aria-label={`${signal.key} ${signal.active ? 'mevcut' : 'yok'}`}
                    title={`${signal.key} ${signal.active ? 'mevcut' : 'yok'}`}
                  >
                    <span className="place-detail-status-icon" aria-hidden="true">
                      {renderDetailSignalIcon(signal.key)}
                    </span>
                  </article>
                )
              ))}
            </div>

            <span className="place-detail-inline-divider" aria-hidden="true" />
            <strong className="place-detail-class-label">{categoryClassLabel}</strong>
            <span className="place-detail-inline-divider" aria-hidden="true" />

            <div className="place-detail-guide-badges" aria-label="Kas Guide badgeleri">
              {guideBadges.map((badge) => (
                <span key={badge} className="place-detail-guide-badge">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="place-detail-content-grid">
          <article className="place-detail-story-card">
            <div className="place-detail-section-head place-detail-section-head-lined">
              <h2>Kısaca</h2>
            </div>
            <p>{place.shortDescription}</p>
          </article>

          <article className="place-detail-story-card">
            <div className="place-detail-section-head place-detail-section-head-lined">
              <h2>Uzunca</h2>
            </div>
            <p>{place.longDescription}</p>
          </article>
        </section>

        {gallery.length > 0 ? <PlaceDetailGallery images={gallery} placeName={place.name} /> : null}

        <div className="place-detail-bottom-actions">
          <Link href="/#categories" className="place-detail-primary">
            Kategorilere Dön
          </Link>
        </div>
      </section>
    </main>
  )
}
