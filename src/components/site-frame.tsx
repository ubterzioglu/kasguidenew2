'use client'

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'

import Link from 'next/link'

import { BackToTopButton } from './back-to-top-button'
import { ClientHeader } from './client-header'
import { ClientPageShell } from './client-page-shell'

type SiteFrameProps = {
  children: ReactNode
}

export function SiteFrame({ children }: SiteFrameProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const mobileMenu = document.querySelector('.header-mobile-menu')
      const hamburger = document.querySelector('.header-hamburger')
      
      if (mobileMenu && hamburger && 
          !mobileMenu.contains(event.target as Node) && 
          !hamburger.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <div id="page-top"></div>

      <ClientHeader>
        <div className="header-content">
          <Link href="/" className="header-mobile-brand">
            <span className="header-brand-icon">K</span>
            Kaş Guide
          </Link>

          <nav className="header-inline-nav header-inline-nav-left" aria-label="Ana navigasyon">
            <Link href="/" className="header-brand">
              <span className="header-brand-icon">K</span>
              <span className="header-brand-text">Kaş Guide</span>
            </Link>
            <span className="header-inline-separator" aria-hidden="true"></span>
            <Link href="/planner" className="header-inline-item">
              Tatilini Planla
            </Link>
            <span className="header-inline-separator" aria-hidden="true"></span>
            <Link href="/arama" className="header-inline-item">
              Mekan Ara
            </Link>
            <span className="header-inline-separator" aria-hidden="true"></span>
            <div className="header-dropdown">
              <button className="header-dropdown-toggle">
                Rehberler
                <svg className="header-dropdown-arrow" viewBox="0 0 20 20" fill="currentColor" width="10" height="10">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="header-dropdown-menu">
                <div className="header-dropdown-header">Kaş Rehberleri</div>
                <Link href="/rehber/tekne-turu" className="header-dropdown-item">
                  <span className="header-dropdown-item-icon">⛵</span>
                  Kaş Tekne Turu
                </Link>
                <Link href="/rehber/dalis-noktalari" className="header-dropdown-item">
                  <span className="header-dropdown-item-icon">🤿</span>
                  Kaş Dalış Noktaları
                </Link>
                <Link href="/rehber/otel-onerileri" className="header-dropdown-item">
                  <span className="header-dropdown-item-icon">🏨</span>
                  Kaş Otel Önerileri
                </Link>
                <Link href="/rehber/gece-hayati" className="header-dropdown-item">
                  <span className="header-dropdown-item-icon">🌙</span>
                  Kaş Gece Hayatı
                </Link>
                <Link href="/rehber/koylar" className="header-dropdown-item">
                  <span className="header-dropdown-item-icon">🏖️</span>
                  Kaş Koyları
                </Link>
                <Link href="/rehber/kahvalti" className="header-dropdown-item">
                  <span className="header-dropdown-item-icon">☕</span>
                  Kaş Kahvaltı
                </Link>
              </div>
            </div>
            <span className="header-inline-separator" aria-hidden="true"></span>
            <a
              href="https://wa.me/4915258450111"
              target="_blank"
              rel="noopener noreferrer"
              className="header-inline-item header-inline-item-accent"
            >
              WhatsApp Topluluğu
            </a>
          </nav>

          <div className="header-status-badge" aria-label="Yayın durumu">
            <span className="header-status-badge-dot" aria-hidden="true"></span>
            Test yayınındayız
          </div>

          <nav className="header-inline-nav header-inline-nav-right" aria-label="Kısa yol">
            <Link href="/" className="header-inline-item">
              Ana Sayfa
            </Link>
          </nav>

          <div className="header-mobile-menu">
            <button
              className="header-hamburger"
              aria-label="Menüyü aç"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            </button>
            <nav
              className={`header-mobile-panel ${isMobileMenuOpen ? 'open' : ''}`}
              aria-label="Mobil menü"
            >
              <Link href="/" className="header-mobile-link">
                Ana Sayfa
              </Link>
              <Link href="/planner" className="header-mobile-link">
                Tatilini Planla
              </Link>
              <Link href="/arama" className="header-mobile-link">
                Mekan Ara
              </Link>
              <div className="header-mobile-divider">Rehberler</div>
              <Link href="/rehber/tekne-turu" className="header-mobile-link header-mobile-link-sub">
                Kaş Tekne Turu
              </Link>
              <Link href="/rehber/dalis-noktalari" className="header-mobile-link header-mobile-link-sub">
                Kaş Dalış Noktaları
              </Link>
              <Link href="/rehber/otel-onerileri" className="header-mobile-link header-mobile-link-sub">
                Kaş Otel Önerileri
              </Link>
              <Link href="/rehber/gece-hayati" className="header-mobile-link header-mobile-link-sub">
                Kaş Gece Hayatı
              </Link>
              <Link href="/rehber/koylar" className="header-mobile-link header-mobile-link-sub">
                Kaş Koyları
              </Link>
              <Link href="/rehber/kahvalti" className="header-mobile-link header-mobile-link-sub">
                Kaş Kahvaltı
              </Link>
              <div className="header-mobile-divider"></div>
              <Link href="/mekan-oner" className="header-mobile-link">
                Mekan Öner
              </Link>
              <a
                href="https://wa.me/4915258450111"
                target="_blank"
                rel="noopener noreferrer"
                className="header-mobile-link header-mobile-link-accent"
              >
                WhatsApp Topluluğu
              </a>
            </nav>
          </div>
        </div>
      </ClientHeader>

      <ClientPageShell>{children}</ClientPageShell>

      <BackToTopButton />
    </>
  )
}
