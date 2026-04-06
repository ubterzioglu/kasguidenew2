'use client'

import Link from 'next/link'

type AdminSectionLinksProps = {
  current: 'places' | 'hero'
  onRefresh: () => void
  refreshLabel: string
  refreshing: boolean
  onLogout: () => void
}

export function AdminSectionLinks({
  current,
  onRefresh,
  refreshLabel,
  refreshing,
  onLogout,
}: AdminSectionLinksProps) {
  return (
    <div className="admin-panel admin-panel-links admin-panel-review">
      <nav className="admin-compact-nav" aria-label="Admin bölümleri">
        <button type="button" className="admin-compact-nav-item admin-compact-nav-action" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Yükleniyor...' : refreshLabel}
        </button>
        <span className="admin-compact-nav-separator" aria-hidden="true" />
        <Link
          href="/admin/places"
          className={`admin-compact-nav-item${current === 'places' ? ' is-active' : ''}`}
        >
          Mekanlar
        </Link>
        <span className="admin-compact-nav-separator" aria-hidden="true" />
        <Link
          href="/admin/hero-slides"
          className={`admin-compact-nav-item${current === 'hero' ? ' is-active' : ''}`}
        >
          Hero
        </Link>
        <span className="admin-compact-nav-separator" aria-hidden="true" />
        <button type="button" className="admin-compact-nav-item admin-compact-nav-action" onClick={onLogout}>
          Çıkış yap
        </button>
      </nav>
    </div>
  )
}
