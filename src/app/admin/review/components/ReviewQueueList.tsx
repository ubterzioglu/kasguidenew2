import { ReviewDashboardSnapshot, ReviewAction } from '../types'
import { formatPlaceStatus, formatReviewStatus, formatDate } from '../formatters'
import { Button } from '@/components/ui/button'

type ReviewQueueListProps = {
  queue: ReviewDashboardSnapshot['queue']
  activeActionId: string | null
  runReviewAction: (reviewId: string, action: ReviewAction, candidatePlaceId?: string | null) => void
}

export function ReviewQueueList({ queue, activeActionId, runReviewAction }: ReviewQueueListProps) {
  if (queue.length === 0) {
    return (
      <section className="admin-empty-state">
        <strong>Henüz review kaydı yok.</strong>
        <p>Normalize ve duplicate akışı yeni kayıt ürettiğinde liste burada dolacak.</p>
      </section>
    )
  }

  return (
    <section className="review-list-shell">
      <div className="review-list-head">
        <span>Ham kayıt</span>
        <span>Eşleşme ve detay</span>
        <span>Durum</span>
        <span>Aksiyonlar</span>
      </div>
      <div className="review-list">
        {queue.map((item) => {
          const isBusy = activeActionId === item.id

          return (
            <article key={item.id} className="review-row">
              <div className="review-row-primary">
                <div className="review-row-title-wrap">
                  <h3 className="review-row-title">{item.rawPlace.nameRaw || 'İsimsiz kayıt'}</h3>
                  <span className="review-row-subtitle">{item.rawPlace.categoryRaw || 'Belirsiz kategori'}</span>
                </div>
                <div className="review-row-meta">
                  <span>{item.rawPlace.addressRaw || 'Adres yok'}</span>
                  <span>{item.rawPlace.phoneRaw || 'Telefon yok'}</span>
                  <span>{item.rawPlace.websiteRaw || 'Website yok'}</span>
                </div>
              </div>

              <div className="review-row-match">
                {item.candidatePlace ? (
                  <>
                    <strong>{item.candidatePlace.name}</strong>
                    <span>{item.candidatePlace.slug}</span>
                    <span>{item.candidatePlace.categoryPrimary} | {formatPlaceStatus(item.candidatePlace.status)}</span>
                  </>
                ) : (
                  <span>Otomatik aday bulunmadı. Yeni mekan gibi duruyor.</span>
                )}
              </div>

              <div className="review-row-status">
                <span className={`review-pill review-pill-${item.status}`}>{formatReviewStatus(item.status)}</span>
                <span className="review-row-reason">{item.score !== null ? `Skor ${item.score}` : item.reason}</span>
                <span className="review-row-date">{formatDate(item.createdAt)}</span>
              </div>

              <div className="review-row-actions admin-card-actions">
                <Button type="button" variant="secondary" onClick={() => runReviewAction(item.id, 'start_review')} disabled={isBusy}>
                  Incele
                </Button>
                <Button type="button" variant="primary" onClick={() => runReviewAction(item.id, 'approve')} disabled={isBusy}>
                  Onayla
                </Button>
                <Button type="button" variant="ghost" onClick={() => runReviewAction(item.id, 'merge', item.candidatePlace?.id ?? null)} disabled={isBusy || !item.candidatePlace}>
                  Birlestir
                </Button>
                <Button type="button" variant="danger" onClick={() => runReviewAction(item.id, 'reject')} disabled={isBusy}>
                  Reddet
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
