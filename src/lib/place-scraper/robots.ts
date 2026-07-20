import 'server-only'

const ROBOTS_FETCH_TIMEOUT_MS = 8000
const USER_AGENT = 'KasGuideServiceFinder/1.0 (+https://www.kasguide.de)'

type RobotsRules = {
  disallow: string[]
  allow: string[]
}

const robotsCache = new Map<string, RobotsRules | null>()

function parseRobotsTxt(body: string): RobotsRules {
  const lines = body.split(/\r?\n/)
  const disallow: string[] = []
  const allow: string[] = []
  let appliesToUs = false
  let inWildcardGroup = false

  for (const rawLine of lines) {
    const line = rawLine.split('#')[0]?.trim() ?? ''
    if (!line) continue

    const [rawField, ...rest] = line.split(':')
    const field = rawField?.trim().toLowerCase()
    const value = rest.join(':').trim()

    if (field === 'user-agent') {
      inWildcardGroup = value === '*'
      if (inWildcardGroup) {
        appliesToUs = true
      }
      continue
    }

    if (!inWildcardGroup) continue

    if (field === 'disallow' && value) {
      disallow.push(value)
    } else if (field === 'allow' && value) {
      allow.push(value)
    }
  }

  return appliesToUs ? { disallow, allow } : { disallow: [], allow: [] }
}

async function getRobotsRules(origin: string): Promise<RobotsRules | null> {
  if (robotsCache.has(origin)) {
    return robotsCache.get(origin) ?? null
  }

  try {
    const response = await fetch(`${origin}/robots.txt`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(ROBOTS_FETCH_TIMEOUT_MS),
    })

    if (!response.ok) {
      robotsCache.set(origin, null)
      return null
    }

    const body = await response.text()
    const rules = parseRobotsTxt(body)
    robotsCache.set(origin, rules)
    return rules
  } catch {
    robotsCache.set(origin, null)
    return null
  }
}

export async function isAllowedByRobots(url: string): Promise<boolean> {
  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  const rules = await getRobotsRules(parsed.origin)
  if (!rules) {
    return true
  }

  const path = parsed.pathname + parsed.search

  const matchingDisallow = rules.disallow
    .filter((rule) => path.startsWith(rule))
    .sort((a, b) => b.length - a.length)[0]

  const matchingAllow = rules.allow
    .filter((rule) => path.startsWith(rule))
    .sort((a, b) => b.length - a.length)[0]

  if (!matchingDisallow) {
    return true
  }

  if (matchingAllow && matchingAllow.length >= matchingDisallow.length) {
    return true
  }

  return false
}
