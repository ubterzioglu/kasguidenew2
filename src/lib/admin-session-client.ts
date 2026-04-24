export async function isAdminLoggedIn(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const response = await fetch('/api/admin/session', { method: 'POST' })
    return response.ok
  } catch {
    return false
  }
}

export async function adminLogin(password: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'X-Admin-Password': password },
      credentials: 'include',
    })

    return response.ok
  } catch {
    return false
  }
}

export async function adminLogout(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  try {
    await fetch('/api/admin/session', {
      method: 'DELETE',
      credentials: 'include',
    })
  } catch {
    // ignore
  }
}

export function hasSessionCookie(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return document.cookie.includes('kasguide-admin-session')
}
