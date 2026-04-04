'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

type AdminSectionLinksProps = {
  current: 'sweeps' | 'places' | 'hero'
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
      <div className="admin-toolbar-actions">
        <Button type="button" variant="primary" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? 'Yukleniyor...' : refreshLabel}
        </Button>
        <Link
          href="/admin/sweeps"
          className={`admin-button admin-button-link ${current === 'sweeps' ? 'admin-button-primary' : 'admin-button-secondary'}`}
        >
          Sweeps
        </Link>
        <Link
          href="/admin/places"
          className={`admin-button admin-button-link ${current === 'places' ? 'admin-button-primary' : 'admin-button-secondary'}`}
        >
          Mekanlar
        </Link>
        <Link
          href="/admin/hero-slides"
          className={`admin-button admin-button-link ${current === 'hero' ? 'admin-button-primary' : 'admin-button-secondary'}`}
        >
          Hero
        </Link>
        <Link href="/admin" className="admin-button admin-button-secondary admin-button-link">
          Admin ana sayfa
        </Link>
        <Button type="button" variant="secondary" onClick={onLogout}>
          Cikis yap
        </Button>
      </div>
    </div>
  )
}
