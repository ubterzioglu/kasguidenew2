import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import {
  clearStoredAdminPassword,
  getStoredAdminPassword as readStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'
import { adminLogin, adminLogout, hasSessionCookie } from '@/lib/admin-session-client'

export function useAdminAuth() {
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(hasSessionCookie)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const success = await adminLogin(password)
      setIsLoggedIn(success)
      if (success) {
        setAdminPassword(password)
        storeAdminPassword(password)
      }
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
    clearStoredAdminPassword()
    setAdminPassword('')
    setIsLoggedIn(false)
    router.replace('/admin')
  }, [router])

  const getStoredAdminPassword = useCallback(() => readStoredAdminPassword(), [])

  const persistPassword = useCallback((password: string) => {
    const normalizedPassword = password.trim()
    setAdminPassword(normalizedPassword)
    storeAdminPassword(normalizedPassword)
  }, [])

  const requireAuth = useCallback(() => {
    const normalizedPassword = adminPassword.trim() || readStoredAdminPassword().trim()
    if (!normalizedPassword) {
      router.replace('/admin')
      return ''
    }

    return normalizedPassword
  }, [adminPassword, router])

  return {
    adminPassword,
    setAdminPassword,
    isLoggedIn,
    isLoading,
    getStoredAdminPassword,
    login,
    logout,
    persistPassword,
    requireAuth,
  }
}
