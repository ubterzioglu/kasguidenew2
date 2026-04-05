'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function ClientPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    // Cross-page hash navigation fix
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 150)
    }
  }, [pathname])

  return (
    <div className={`page-shell ${isHomePage ? 'page-shell-home' : isAdminRoute ? 'page-shell-admin' : 'page-shell-subpage'}`}>
      {isHomePage ? (
        <div className="page-shell-bubbles" aria-hidden="true">
          <span className="page-shell-bubble bubble-1"></span>
          <span className="page-shell-bubble bubble-2"></span>
          <span className="page-shell-bubble bubble-3"></span>
          <span className="page-shell-bubble bubble-4"></span>
          <span className="page-shell-bubble bubble-5"></span>
          <span className="page-shell-bubble bubble-6"></span>
          <span className="page-shell-bubble bubble-7"></span>
          <span className="page-shell-bubble bubble-8"></span>
        </div>
      ) : null}
      {children}
    </div>
  )
}
