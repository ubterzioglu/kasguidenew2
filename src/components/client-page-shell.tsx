'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function ClientPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <div className={`page-shell ${isHomePage ? 'page-shell-home' : 'page-shell-subpage'}`}>
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
