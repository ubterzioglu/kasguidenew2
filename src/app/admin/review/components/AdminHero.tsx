import { ReviewDashboardSnapshot } from '../types'

export function AdminHero({ stats }: { stats: ReviewDashboardSnapshot['stats'] }) {
  return (
    <section className="admin-hero admin-hero-review">
      <div className="admin-summary-card admin-summary-card-review">
        <div className="admin-summary-item">
          <span className="admin-summary-label">Ham kayıt</span>
          <strong>{stats.pendingRawPlaces}</strong>
        </div>
        <div className="admin-summary-item">
          <span className="admin-summary-label">Taslak mekan</span>
          <strong>{stats.draftPlaces}</strong>
        </div>
        <div className="admin-summary-item">
          <span className="admin-summary-label">Yayında</span>
          <strong>{stats.publishedPlaces}</strong>
        </div>
        <div className="admin-summary-item">
          <span className="admin-summary-label">Toplam sweep</span>
          <strong>{stats.trackedSweeps}</strong>
        </div>
      </div>
    </section>
  )
}
