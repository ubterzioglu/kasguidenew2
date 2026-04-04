'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function ClientHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isAdminEntryPage = pathname === '/admin'

  if (isAdminEntryPage) {
    return null
  }

  return (
    <header className={`header ${isHomePage ? 'header-home' : 'header-subpage'}`}>
      {children}
    </header>
  )
}
