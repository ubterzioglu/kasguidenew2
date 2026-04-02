'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from '@/lib/admin-password-client'

import type {
  ReviewQueueStatus,
  ReviewAction,
  GridSweepStatus,
  StatusTone,
  RawPlaceAction,
  GridSweepCellItem,
  GridSweepItem,
  PlaceEditorDraft,
  RecentRawPlaceItem,
  ReviewDashboardSnapshot,
  ReviewQueueItem,
  PanelStatus,
} from './types'

const INITIAL_STATUS: PanelStatus = {
  tone: 'neutral',
  message: 'Sweep ve mekan editörü yükleniyor...',
}

const EMPTY_SNAPSHOT: ReviewDashboardSnapshot = {
  queue: [],
  sweeps: [],
  rawResults: [],
  stats: {
    pendingReviews: 0,
    pendingRawPlaces: 0,
    draftPlaces: 0,
    publishedPlaces: 0,
    trackedSweeps: 0,
    runningSweeps: 0,
  },
  categoryOptions: [],
}

import { useReviewDashboard } from './useReviewDashboard'
import { AdminHero } from './components/AdminHero'
import { SweepBoard } from './components/SweepBoard'
import { ReviewQueueList } from './components/ReviewQueueList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import {
  decodeLabel,
  formatSweepStatus,
  formatSweepMode,
  formatDate,
  formatBbox,
  formatCellStatus,
  formatReviewStatus,
  mapProcessingStatusTone,
  formatProcessingStatus,
  formatPlaceStatus,
  formatVerificationStatus,
} from './formatters'

export default function ReviewAdminPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  const {
    snapshot,
    drafts,
    status,
    isLoading,
    activeActionId,
    activeRawPlaceId,
    setActiveRawPlaceId,
    loadDashboard,
    runReviewAction,
    runRawPlaceAction,
    updateDraftField,
    updateImageField,
    addImageField,
    removeImageField,
    logout,
  } = useReviewDashboard()

  const totalPages = Math.ceil(snapshot.rawResults.length / ITEMS_PER_PAGE)
  const paginatedRawResults = snapshot.rawResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <main className="container admin-shell">
      <AdminHero stats={snapshot.stats} />

      <section className="admin-toolbar">
        <div className="admin-panel admin-panel-links admin-panel-review">
          <div className="admin-toolbar-actions">
            <Button type="button" variant="primary" onClick={() => loadDashboard()} disabled={isLoading}>
              {isLoading ? 'Yükleniyor...' : 'Paneli yenile'}
            </Button>
            <Link href="/admin" className="admin-button admin-button-secondary admin-button-link">
              Admin ana sayfa
            </Link>
            <Button type="button" variant="secondary" onClick={logout}>
              Çıkış yap
            </Button>
          </div>
        </div>

        <div className={`admin-status admin-status-${status.tone}`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Grid sweep geçmişi</h2>
          <p className="admin-section-copy">Hangi kare tarandı, kaç mekan çekildi ve sweep durumunun ne olduğu burada görünür.</p>
        </div>
      </section>
      <SweepBoard sweeps={snapshot.sweeps} />

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Sweep edilen mekanlar</h2>
          <p className="admin-section-copy">
            Her satırda ham Google verisini görüp kategori, mekan başlığı, açıklama ve foto alanlarını düzenleyebilirsin.
          </p>
        </div>
      </section>

      {snapshot.rawResults.length === 0 ? (
        <section className="admin-empty-state">
          <strong>Henüz listelenecek mekan yok.</strong>
          <p>Yeni bir grid sweep tamamlandığında mekan editörü burada dolacak.</p>
        </section>
      ) : (
        <section className="place-review-shell">
          {paginatedRawResults.map((item) => {
            const isOpen = activeRawPlaceId === item.id
            const isBusy = activeActionId === item.id
            const draft = drafts[item.id] ?? item.draft
            const nonEmptyImageCount = draft.imageUrls.map((entry) => entry.trim()).filter(Boolean).length

            return (
              <article key={item.id} className={`place-review-card${isOpen ? ' is-open' : ''}`}>
                <button type="button" className="place-review-summary" onClick={() => setActiveRawPlaceId(isOpen ? null : item.id)}>
                  <div className="place-review-row-grid">
                    <span className="place-review-grid-pill">{item.gridKey || 'Grid yok'}</span>
                    <h3 className="place-review-single-title">{draft.name || item.nameRaw || 'İsimsiz mekan'}</h3>
                    <span className="place-review-single-cat">{draft.categoryPrimary || item.categoryRaw || 'Kategori yok'}</span>
                    <span className="place-review-single-address">{draft.address || item.addressRaw || 'Adres yok'}</span>
                    <span className={`review-pill review-pill-${mapProcessingStatusTone(item.processingStatus)}`}>{formatProcessingStatus(item.processingStatus)}</span>
                    <div className="place-review-single-actions">
                      <span style={{ fontSize: '0.8rem', color: '#35c8b4' }}>{nonEmptyImageCount}/5 foto</span>
                      <strong style={{ fontSize: '0.85rem', color: isOpen ? '#fff' : '#35c8b4' }}>{isOpen ? 'Editörü kapat' : 'Düzenle'}</strong>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="place-review-editor">
                    <div className="place-review-raw-grid">
                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Google kaynagi</span>
                        <strong>{item.nameRaw || 'İsimsiz mekan'}</strong>
                        <p>{item.categoryRaw || 'Kategori yok'}</p>
                        <p>{item.addressRaw || 'Adres yok'}</p>
                        <p>{item.phoneRaw || 'Telefon yok'}</p>
                        <p>{item.websiteRaw || 'Website yok'}</p>
                        {item.googleMapsUri ? <a href={item.googleMapsUri} target="_blank" rel="noopener noreferrer" className="admin-inline-link">Google Maps kaydını aç</a> : null}
                      </div>

                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Yayın durumu</span>
                        <strong>{formatPlaceStatus(draft.status)}</strong>
                        <p>Doğrulama: {formatVerificationStatus(draft.verificationStatus)}</p>
                        <p>Kaynak: {item.sourceName} / {item.sourceId}</p>
                        <p>Koordinat: {item.lat !== null && item.lng !== null ? `${item.lat.toFixed(6)}, ${item.lng.toFixed(6)}` : 'Yok'}</p>
                      </div>
                    </div>

                    <div className="place-editor-grid">
                      <Input
                        label="Mekan adı"
                        value={draft.name}
                        onChange={(event) => updateDraftField(item.id, 'name', event.target.value)}
                      />

                      <Input
                        label="Mekan başlığı"
                        value={draft.headline}
                        onChange={(event) => updateDraftField(item.id, 'headline', event.target.value)}
                      />

                      <Textarea
                        label="Kısa açıklama"
                        isWide
                        rows={3}
                        value={draft.shortDescription}
                        onChange={(event) => updateDraftField(item.id, 'shortDescription', event.target.value)}
                      />

                      <Textarea
                        label="Detaylı açıklama"
                        isWide
                        rows={5}
                        value={draft.longDescription}
                        onChange={(event) => updateDraftField(item.id, 'longDescription', event.target.value)}
                      />

                      <Select
                        label="Kategori"
                        value={draft.categoryPrimary}
                        onChange={(event) => updateDraftField(item.id, 'categoryPrimary', event.target.value)}
                        options={snapshot.categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
                      />

                      <Input
                        label="Website"
                        value={draft.website}
                        onChange={(event) => updateDraftField(item.id, 'website', event.target.value)}
                        placeholder="https://..."
                      />

                      <Input
                        label="Adres"
                        isWide
                        value={draft.address}
                        onChange={(event) => updateDraftField(item.id, 'address', event.target.value)}
                      />

                      <Input
                        label="Telefon"
                        value={draft.phone}
                        onChange={(event) => updateDraftField(item.id, 'phone', event.target.value)}
                      />
                    </div>

                    <div className="place-photo-panel">
                      <div className="place-photo-header">
                        <div>
                          <h4>Fotoğraflar</h4>
                          <p>Her mekan için en az 1, en fazla 5 foto URL gir. İlk foto kapak olarak kullanılır.</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={() => addImageField(item.id)} disabled={draft.imageUrls.length >= 5}>
                          Foto ekle
                        </Button>
                      </div>

                      <div className="place-photo-list">
                        {draft.imageUrls.map((imageUrl, index) => (
                          <div key={`${item.id}-image-${index}`} className="place-photo-row">
                            <Input
                              label={`Foto URL #${index + 1}`}
                              isWide
                              value={imageUrl}
                              onChange={(event) => updateImageField(item.id, index, event.target.value)}
                              placeholder="https://..."
                            />
                            <Button type="button" variant="ghost" onClick={() => removeImageField(item.id, index)}>
                              Kaldır
                            </Button>
                            {imageUrl.trim() ? <img src={imageUrl} alt="Önizleme" className="place-photo-preview" /> : <div className="place-photo-placeholder">Önizleme yok</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="place-editor-actions">
                      <Button type="button" variant="secondary" onClick={() => runRawPlaceAction(item.id, 'save_draft')} disabled={isBusy}>
                        {isBusy ? 'Kaydediliyor...' : 'Taslağı kaydet'}
                      </Button>
                      <Button type="button" variant="primary" onClick={() => runRawPlaceAction(item.id, 'publish')} disabled={isBusy}>
                        {isBusy ? 'Yayına hazırlanıyor...' : 'Onayla ve yayına al'}
                      </Button>
                      <Button type="button" variant="danger" onClick={() => runRawPlaceAction(item.id, 'reject')} disabled={isBusy}>
                        Reddet
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}

          {totalPages > 1 && (
            <div className="admin-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                Önceki Sayfa
              </Button>
              <span style={{ color: '#fff', alignSelf: 'center' }}>
                Sayfa {currentPage} / {totalPages}
              </span>
              <Button type="button" variant="secondary" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Sonraki Sayfa
              </Button>
            </div>
          )}
        </section>
      )}

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Review kuyruğu</h2>
          <p className="admin-section-copy">Duplicate veya eksik veri nedeniyle işaretlenen kayıtlar için hızlı review listesi.</p>
        </div>
      </section>

      <ReviewQueueList
        queue={snapshot.queue}
        activeActionId={activeActionId}
        runReviewAction={runReviewAction}
      />
    </main>
  )
}
