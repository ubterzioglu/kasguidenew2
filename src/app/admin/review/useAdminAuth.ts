import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { adminLogin, adminLogout, hasSessionCookie } from '@/lib/admin-session-client'

export function useAdminAuth() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(hasSessionCookie)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const success = await adminLogin(password)
      setIsLoggedIn(success)
      return success
    } catch {
      setIsLoggedIn(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await adminLogout()
    setIsLoggedIn(false)
    router.replace('/admin')
  }, [router])

  return {
    isLoggedIn,
    isLoading,
    login,
    logout,
  }
}
