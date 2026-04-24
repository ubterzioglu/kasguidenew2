type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  entry.count += 1
  const allowed = entry.count <= maxRequests
  const remaining = Math.max(0, maxRequests - entry.count)

  return { allowed, remaining, resetAt: entry.resetAt }
}

export function getRateLimitKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}
