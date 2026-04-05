'use client'

import Link from 'next/link'

import { CATEGORY_MAP } from '@/lib/categories'

import type { CategoryPlace } from './types'

type CategoryPlaceCardProps = {
  place: CategoryPlace
}

export function CategoryPlaceCard({ place }: CategoryPlaceCardProps) {
  return (
    <Link href={`/mekan/${place.slug}`} className="category-place-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={place.imageUrl || CATEGORY_MAP.get(place.categoryPrimary)?.imageUrl || ''}
        alt={place.headline || place.name}
        className="category-place-media"
        loading="lazy"
      />
      <div className="category-place-body">
        <span className="category-place-eyebrow">
          {CATEGORY_MAP.get(place.categoryPrimary)?.label || place.categoryPrimary}
        </span>
        <span className="category-place-divider" aria-hidden="true" />
        <h5 className="category-place-title">{place.name}</h5>
        <span className="category-place-divider" aria-hidden="true" />
        <p className="category-place-copy">{place.shortDescription}</p>
        <div className="category-place-signals">
          <span
            className={`category-place-signal${place.address ? ' is-active' : ' is-muted'}`}
            aria-label={`Adres ${place.address ? 'mevcut' : 'yok'}`}
            title={`Adres ${place.address ? 'mevcut' : 'yok'}`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="9" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span
            className={`category-place-signal${place.phone ? ' is-active' : ' is-muted'}`}
            aria-label={`Telefon ${place.phone ? 'mevcut' : 'yok'}`}
            title={`Telefon ${place.phone ? 'mevcut' : 'yok'}`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M6.8 3.5h2.6c.5 0 .9.3 1 .7l.8 3.2c.1.4 0 .8-.3 1l-1.7 1.4a14.4 14.4 0 0 0 5 5l1.4-1.7c.3-.3.7-.4 1-.3l3.2.8c.5.1.8.5.8 1v2.6c0 .6-.5 1.1-1.1 1.1C10.7 19.8 4.2 13.3 4.2 4.6c0-.6.5-1.1 1.1-1.1z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={`category-place-signal${place.website ? ' is-active' : ' is-muted'}`}
            aria-label={`Website ${place.website ? 'mevcut' : 'yok'}`}
            title={`Website ${place.website ? 'mevcut' : 'yok'}`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
