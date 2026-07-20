'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { adminLogout } from '@/lib/admin-session-client'

import { useAdminSidebarRefreshState } from './AdminSidebarActionsContext'

type SidebarSection = {
  key: string
  href: string
  label: string
  icon: React.ReactNode
  isActive: (pathname: string) => boolean
}

const SECTIONS: SidebarSection[] = [
  {
    key: 'places',
    href: '/admin/places',
    label: 'Mekanlar',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.4" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/places'),
  },
  {
    key: 'hero',
    href: '/admin/hero-slides',
    label: 'Hero',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2.4" />
        <path d="M3 15l5-5 4 4 3-3 6 6" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/hero-slides'),
  },
  {
    key: 'updates',
    href: '/admin/updates',
    label: 'Haberler ve Duyurular',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4z" />
        <path d="M8 9h7M8 12.5h7M8 16h4" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/updates'),
  },
  {
    key: 'scrapers',
    href: '/admin/scrapers/news',
    label: "Scraper'lar",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-4.4-4.4" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/scrapers'),
  },
  {
    key: 'social',
    href: '/admin/social',
    label: 'Sosyal Medya',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="13" rx="2.4" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/social'),
  },
  {
    key: 'activity',
    href: '/admin/activity',
    label: 'Aktiviteler',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/activity'),
  },
]

export default function AdminSidebar() {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const refreshAction = useAdminSidebarRefreshState()

  async function handleLogout() {
    await adminLogout()
    router.replace('/admin')
  }

  return (
    <aside className="admin-sidebar" aria-label="Admin bölümleri">
      <div className="admin-sidebar-brand">
        <span className="admin-eyebrow admin-sidebar-eyebrow">Admin</span>
      </div>

      <nav className="admin-sidebar-nav">
        {SECTIONS.map((section) => {
          const active = section.isActive(pathname)

          return (
            <Link
              key={section.key}
              href={section.href}
              className={`admin-sidebar-link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="admin-sidebar-link-icon">{section.icon}</span>
              <span className="admin-sidebar-link-label">{section.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="admin-sidebar-footer">
        {refreshAction ? (
          <button
            type="button"
            className="admin-sidebar-action"
            onClick={refreshAction.onRefresh}
            disabled={refreshAction.refreshing}
          >
            {refreshAction.refreshing ? 'Yükleniyor...' : refreshAction.label}
          </button>
        ) : null}

        <button type="button" className="admin-sidebar-action admin-sidebar-action-logout" onClick={() => void handleLogout()}>
          Çıkış yap
        </button>
      </div>
    </aside>
  )
}
