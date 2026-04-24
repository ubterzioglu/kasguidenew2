'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { adminLogin, adminLogout, hasSessionCookie } from '@/lib/admin-session-client'

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
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<PanelStatus>(INITIAL_STATUS)

  useEffect(() => {
    if (hasSessionCookie()) {
      router.replace('/admin/places')
    }
  }, [router])

  async function validatePassword() {
    const password = adminPassword.trim()

    if (!password) {
      setStatus({ tone: 'error', message: 'Devam etmek için admin şifresini girin.' })
      return
    }

    setIsLoading(true)
    setStatus({ tone: 'neutral', message: '' })

    try {
      const success = await adminLogin(password)

      if (!success) {
        throw new Error('Admin şifresi hatalı. ADMIN_PASSWORD değiştiyse sunucuyu yeniden başlatın.')
      }

      setIsAuthorized(true)
      setAdminPassword('')
      setStatus({ tone: 'success', message: 'Giriş başarılı. Devam etmek istediğin alanı seç.' })
      router.replace('/admin/places')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parola doğrulanamadı.'

      setIsAuthorized(false)
      setStatus({
        tone: 'error',
        message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  function resetGate() {
    void adminLogout()
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
            {isLoading ? 'Kontrol ediliyor...' : 'Giriş yap'}
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
            <Link href="/admin/places" className="admin-nav-card admin-nav-card-simple">
              <strong>Mekanlar</strong>
              <p>Bütün mekanları tek tabloda yönet</p>
            </Link>
            <Link href="/admin/updates" className="admin-nav-card admin-nav-card-simple">
              <strong>Haberler ve Duyurular</strong>
              <p>Carousel akışındaki haber ve duyuruları tek panelden yönet</p>
            </Link>
            <Link href="/admin/hero-slides" className="admin-nav-card admin-nav-card-simple">
              <strong>Hero alanı</strong>
              <p>Slide fotoğrafları, başlıklar, alt başlıklar ve tagler</p>
            </Link>
          </section>

          <div className="admin-toolbar-actions">
            <button
              type="button"
              className="admin-button admin-button-secondary"
              onClick={resetGate}
            >
              Çıkış yap
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
