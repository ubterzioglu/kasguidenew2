'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function ClientHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  return (
    <header className={`header ${isHomePage ? 'header-home' : 'header-subpage'}`}>
      {children}
    </header>
  )
}
