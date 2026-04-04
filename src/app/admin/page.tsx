'use client'

import Link from 'next/link'
import { useState } from 'react'

import { clearStoredAdminPassword, storeAdminPassword } from '@/lib/admin-password-client'

type StatusTone = 'neutral' | 'success' | 'error'

type PanelStatus = {
  tone: StatusTone
  message: string
}

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: '',
}

export default function AdminHomePage() {
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)

  async function validatePassword() {
    const password = adminPassword.trim()

    if (!password) {
      setStatus({ tone: 'error', message: 'Devam etmek icin admin sifresini girin.' })
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: '' })

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'X-Admin-Password': password,
        },
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(payload?.error || 'Parola dogrulanamadi.')
      }

      storeAdminPassword(password)
      setIsAuthorized(true)
      setStatus({ tone: 'success', message: 'Giris basarili. Devam etmek istedigin alani sec.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parola dogrulanamadi.'

      clearStoredAdminPassword()
      setIsAuthorized(false)
      setStatus({
        tone: 'error',
        message:
          message === 'Yetkisiz istek.'
            ? 'Admin sifresi hatali. ADMIN_PASSWORD degistiyse sunucuyu yeniden baslatin.'
            : message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  function resetGate() {
    clearStoredAdminPassword()
    setAdminPassword('')
    setIsAuthorized(false)
    setStatus({ tone: 'neutral', message: '' })
  }

  return (
    <main className={`${isAuthorized ? 'container ' : ''}admin-shell admin-entry-shell${!isAuthorized ? ' admin-entry-shell-dark' : ''}`}>
      {!isAuthorized ? (
        <section className="admin-gate-plain">
          <input
            className="admin-input"
            type="password"
            placeholder="ADMIN_PASSWORD"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void validatePassword()
              }
            }}
            autoFocus
          />

          <button
            type="button"
            className="admin-button admin-button-primary"
            onClick={() => void validatePassword()}
            disabled={isLoading}
          >
            {isLoading ? 'Kontrol ediliyor...' : 'Giris yap'}
          </button>

          {status.message ? (
            <div className={`admin-status admin-status-${status.tone}`}>
              <span>{status.message}</span>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="admin-choice-shell">
          <div className="admin-choice-header">
            <span className="admin-eyebrow">Admin</span>
            <h1 className="admin-gate-title">Ne yapmak istiyorsun?</h1>
          </div>

          <section className="admin-nav-grid admin-nav-grid-simple">
            <Link href="/admin/sweeps" className="admin-nav-card admin-nav-card-simple">
              <strong>Sweeps</strong>
              <p>Sweep oturumlari ve sweep kaynakli mekanlar</p>
            </Link>
            <Link href="/admin/places" className="admin-nav-card admin-nav-card-simple">
              <strong>Mekanlar</strong>
              <p>Butun mekanlari tek tabloda yonet</p>
            </Link>
            <Link href="/admin/hero-slides" className="admin-nav-card admin-nav-card-simple">
              <strong>Hero alani</strong>
              <p>Slide fotograflari, basliklar, alt basliklar ve tagler</p>
            </Link>
          </section>

          <div className="admin-toolbar-actions">
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={resetGate}
            >
              Cikis yap
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
