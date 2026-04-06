import type { PublicPlaceBadge } from '@/lib/public-place-types'

type PlaceGuideBadgesProps = {
  badges: PublicPlaceBadge[]
  variant?: 'detail' | 'card'
  className?: string
  ariaLabel?: string
}

export function PlaceGuideBadges({
  badges,
  variant = 'detail',
  className = '',
  ariaLabel = 'Kaş Guide badge rozetleri',
}: PlaceGuideBadgesProps) {
  if (badges.length === 0) {
    return null
  }

  const rootClassName = [
    'place-guide-badges',
    variant === 'card' ? 'place-guide-badges-card' : 'place-guide-badges-detail',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName} aria-label={ariaLabel}>
      {badges.map((badge) => (
        <span
          key={badge.slug}
          className={`place-guide-badge place-guide-badge-${variant}`}
          aria-label={`${badge.label}: ${badge.description}`}
          title={`${badge.label}: ${badge.description}`}
        >
          <span className="place-guide-badge-icon" aria-hidden="true">
            {badge.icon}
          </span>
        </span>
      ))}
    </div>
  )
}
