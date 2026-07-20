'use client'

import Link from 'next/link'

import { getRandomNewsImage } from '@/lib/random-image'
import type { UpdateCarouselItem } from '@/types/updates'

type Props = {
  items: UpdateCarouselItem[]
}

export function NewsAnnouncementsCarousel({ items }: Props) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="updates-section" aria-label="Haberler ve duyurular">
      <div className="updates-section-header">
        <div className="updates-section-heading">
          <p className="updates-section-eyebrow">Güncel</p>
          <h2 className="updates-section-title">Kaş&apos;ta bu sezon hangi haberler ve duyurular öne çıkıyor?</h2>
        </div>
        <Link href="/haberler" className="updates-section-link">
          Tümünü Gör
        </Link>
      </div>

      <div className="updates-carousel-shell updates-marquee-shell">
        <div className="updates-marquee" aria-live="polite">
          <div className="updates-marquee-track">
            {[0, 1].map((groupIndex) => (
              <div
                key={`updates-marquee-group-${groupIndex}`}
                className="updates-marquee-group"
                aria-hidden={groupIndex === 1}
              >
                {items.map((item) => (
                  <Link key={`${groupIndex}-${item.id}`} href={item.href} className="updates-card">
                    <div className="updates-card-media-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || getRandomNewsImage(item.id)}
                        alt={item.title || 'Güncel içerik görseli'}
                        className="updates-card-media"
                        loading="lazy"
                      />
                      <span className={`updates-card-badge updates-card-badge-${item.type}`}>
                        {item.badgeLabel}
                      </span>
                    </div>
                    <div className="updates-card-copy">
                      <span className="updates-card-date">{item.dateLabel}</span>
                      <h3 className="updates-card-title">{item.title}</h3>
                      <p className="updates-card-summary">{item.summary}</p>
                      <span className="updates-card-cta">Detayı Gör</span>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
