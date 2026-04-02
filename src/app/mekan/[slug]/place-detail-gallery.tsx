'use client'

import { useState } from 'react'

type PlaceDetailGalleryProps = {
  images: string[]
  placeName: string
}

export function PlaceDetailGallery({ images, placeName }: PlaceDetailGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(1)
  const visibleImages = images.slice(0, visibleCount)
  const hasMore = visibleCount < images.length

  return (
    <section className="place-detail-gallery">
      <div className="place-detail-gallery-grid place-detail-gallery-grid-compact">
        {visibleImages.map((imageUrl, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${placeName}-gallery-${index}`}
            src={imageUrl}
            alt={`${placeName} — galeri ${index + 1}`}
            className="place-detail-gallery-item place-detail-gallery-item-compact"
            loading="lazy"
          />
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          className="place-detail-gallery-more"
          onClick={() => setVisibleCount((current) => Math.min(current + 1, images.length))}
        >
          Daha Fazla Göster
        </button>
      ) : null}
    </section>
  )
}
