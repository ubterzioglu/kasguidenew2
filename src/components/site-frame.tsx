import type { ReactNode } from 'react'

import Link from 'next/link'

import { BackToTopButton } from './back-to-top-button'
import { ClientHeader } from './client-header'
import { ClientPageShell } from './client-page-shell'

type SiteFrameProps = {
  children: ReactNode
}

export function SiteFrame({ children }: SiteFrameProps) {
  return (
    <>
      <div id="page-top"></div>

      <ClientHeader>
        <div className="header-content">
          <Link href="/" className="header-mobile-brand">
            Kaş Guide
          </Link>

          <nav className="header-inline-nav header-inline-nav-left" aria-label="Ana navigasyon">
            <Link href="/" className="header-inline-item">
              Kaş Guide
            </Link>
            <span className="header-inline-separator" aria-hidden="true"></span>
            <Link href="/#categories" className="header-inline-item">
              Kategoriler
            </Link>
            <span className="header-inline-separator" aria-hidden="true"></span>
            <Link href="/iletisim" className="header-inline-item">
              İletişim
            </Link>
            <span className="header-inline-separator" aria-hidden="true"></span>
            <a
              href="https://wa.me/4915258450111"
              target="_blank"
              rel="noopener noreferrer"
              className="header-inline-item"
            >
              WhatsApp Topluluğu
            </a>
          </nav>

          <nav className="header-inline-nav header-inline-nav-right" aria-label="Kısa yol">
            <Link href="/" className="header-inline-item">
              Ana Sayfa
            </Link>
          </nav>

          <details className="header-mobile-menu">
            <summary className="header-hamburger" aria-label="Menüyü aç">
              <span></span>
              <span></span>
              <span></span>
            </summary>
            <nav className="header-mobile-panel" aria-label="Mobil menü">
              <Link href="/" className="header-mobile-link">
                Ana Sayfa
              </Link>
              <Link href="/#categories" className="header-mobile-link">
                Kategoriler
              </Link>
              <Link href="/iletisim" className="header-mobile-link">
                İletişim
              </Link>
              <a
                href="https://wa.me/4915258450111"
                target="_blank"
                rel="noopener noreferrer"
                className="header-mobile-link"
              >
                WhatsApp Topluluğu
              </a>
            </nav>
          </details>
        </div>
      </ClientHeader>

      <ClientPageShell>{children}</ClientPageShell>

      <BackToTopButton />
    </>
  )
}
