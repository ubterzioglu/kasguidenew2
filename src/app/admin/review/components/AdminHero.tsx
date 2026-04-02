import { ReviewDashboardSnapshot } from '../types'

export function AdminHero({ stats }: { stats: ReviewDashboardSnapshot['stats'] }) {
  return (
    <section className="admin-hero admin-hero-review">
      <div className="admin-hero-copy admin-hero-copy-review">
        <span className="admin-eyebrow">Sweep Operasyonu</span>
        <h1 className="admin-title">Sweep edilen mekanları düzenle, fotoğrafları ekle ve yayına al</h1>
        <p className="admin-description">
          Google'dan gelen ham sweep kayıtlarını burada satır satır düzenleyip kategori, başlık, açıklama ve foto
          bilgileriyle gerçek mekan kaydına dönüştürüyoruz.
        </p>
        <div className="admin-hero-notes">
          <span>Min 1, max 5 foto</span>
          <span>Onaylanan mekanlar anasayfada kategoriye göre gösterilir</span>
        </div>
      </div>

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
