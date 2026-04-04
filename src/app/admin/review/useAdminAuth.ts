import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'

/**
 * Manages admin password state, session persistence, and logout.
 * Returns a `requireAuth` guard used at the top of each action handler.
 */
export function useAdminAuth() {
  const router = useRouter()
  const [adminPassword, setAdminPassword] = useState('')

  const logout = useCallback(() => {
    clearStoredAdminPassword()
    setAdminPassword('')
    router.replace('/admin')
  }, [router])

  /** Returns trimmed password or redirects to /admin and returns null. */
  const requireAuth = useCallback((): string | null => {
    const password = adminPassword.trim()
    if (!password) {
      router.replace('/admin')
      return null
    }
    return password
  }, [adminPassword, router])

  /** Persists a valid password after a successful API call. */
  const persistPassword = useCallback((password: string) => {
    storeAdminPassword(password)
    setAdminPassword(password)
  }, [])

  return {
    adminPassword,
    setAdminPassword,
    getStoredAdminPassword,
    logout,
    requireAuth,
    persistPassword,
  }
}
