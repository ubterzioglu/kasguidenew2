'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function ClientHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return null
  }

  return (
    <header className={`header ${isHomePage ? 'header-home' : 'header-subpage'}`}>
      {children}
    </header>
  )
}
