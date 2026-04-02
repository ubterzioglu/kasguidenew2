'use client'

import { useEffect } from 'react'
import Link from 'next/link'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PlaceDetailError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="place-detail-page">
      <div className="error-shell">
        <div className="error-card">
          <span className="landing-eyebrow">Mekan yüklenemedi</span>
          <h2 className="error-title">Bir sorun oluştu</h2>
          <p className="error-copy">
            Bu mekan sayfası yüklenirken beklenmedik bir hata oluştu.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="hero-primary-action" onClick={reset}>
              Tekrar Dene
            </button>
            <Link href="/#categories" className="hero-secondary-action">
              Kategorilere Dön
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
