'use client'

import { useEffect } from 'react'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error(error)
  }, [error])

  return (
    <div className="error-shell">
      <div className="error-card">
        <span className="landing-eyebrow">Bir sorun oluştu</span>
        <h2 className="error-title">Sayfa yüklenemedi</h2>
        <p className="error-copy">
          Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <button type="button" className="hero-primary-action" onClick={reset}>
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}
