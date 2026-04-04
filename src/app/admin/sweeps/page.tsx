'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { AdminSectionLinks } from '../components/AdminSectionLinks'
import { PlaceEditorForm } from '../review/components/PlaceEditorForm'
import { SweepBoard } from '../review/components/SweepBoard'
import {
  formatDate,
  formatPlaceStatus,
  formatProcessingStatus,
  formatVerificationStatus,
  mapProcessingStatusTone,
} from '../review/formatters'
import { useSweepsDashboard } from './useSweepsDashboard'

export default function AdminSweepsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  const {
    snapshot,
    drafts,
    status,
    isLoading,
    activeActionId,
    activeSweepPlaceId,
    setActiveSweepPlaceId,
    loadDashboard,
    runSweepPlaceAction,
    updateDraftField,
    updateImageField,
    addImageField,
    removeImageField,
    logout,
  } = useSweepsDashboard()

  const totalPages = Math.max(1, Math.ceil(snapshot.sweepPlaces.length / itemsPerPage))
  const paginatedPlaces = snapshot.sweepPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const categoryOptions = snapshot.categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))

  return (
    <main className="container admin-shell">
      <section className="admin-hero admin-hero-review">
        <div className="admin-summary-card admin-summary-card-review">
          <div className="admin-summary-item">
            <span className="admin-summary-label">Toplam sweep</span>
            <strong>{snapshot.stats.trackedSweeps}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Calisan sweep</span>
            <strong>{snapshot.stats.runningSweeps}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Sweeped mekan</span>
            <strong>{snapshot.stats.sweepPlaces}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Bekleyen</span>
            <strong>{snapshot.stats.pendingSweepPlaces}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Yayinda</span>
            <strong>{snapshot.stats.publishedSweepPlaces}</strong>
          </div>
        </div>
      </section>

      <section className="admin-toolbar">
        <AdminSectionLinks
          current="sweeps"
          onRefresh={() => loadDashboard()}
          refreshLabel="Sweep panelini yenile"
          refreshing={isLoading}
          onLogout={logout}
        />

        <div className={`admin-status admin-status-${status.tone}`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Sweep oturumlari</h2>
          <p className="admin-section-copy">
            Sweep operasyonlari artik mekan review akısından ayrildi. Burada sadece tarama oturumlari ve sonuclari gorunur.
          </p>
        </div>
      </section>

      <SweepBoard sweeps={snapshot.sweeps} />

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Sweep kaynakli mekanlar</h2>
          <p className="admin-section-copy">
            Bu liste sadece `sweeped` etiketli mekanlari gosterir. Mekanlar yine ayni `places` tablosunda kalir.
          </p>
        </div>
      </section>

      {snapshot.sweepPlaces.length === 0 ? (
        <section className="admin-empty-state">
          <strong>Henüz listelenecek sweep mekan yok.</strong>
          <p>Yeni bir sweep tamamlandiginda mekanlar burada gorunecek.</p>
        </section>
      ) : (
        <section className="place-review-shell">
          {paginatedPlaces.map((item) => {
            const isOpen = activeSweepPlaceId === item.id
            const isBusy = activeActionId === item.id
            const draft = drafts[item.id] ?? item.draft
            const nonEmptyImageCount = draft.imageUrls.map((entry) => entry.trim()).filter(Boolean).length
            const placeTone = mapProcessingStatusTone(draft.status)

            return (
              <article key={item.id} className={`place-review-card${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="place-review-summary"
                  onClick={() => setActiveSweepPlaceId(isOpen ? null : item.id)}
                >
                  <div className="place-review-row-grid">
                    <span className="place-review-grid-pill">{item.gridKey || item.sourceName || 'Sweep'}</span>
                    <h3 className="place-review-single-title">{draft.name || item.nameRaw || 'Isimsiz mekan'}</h3>
                    <span className="place-review-single-cat">{draft.categoryPrimary || item.categoryRaw || 'Kategori yok'}</span>
                    <span className="place-review-single-address">{draft.address || item.addressRaw || 'Adres yok'}</span>
                    <span className={`review-pill review-pill-${placeTone}`}>{formatPlaceStatus(draft.status)}</span>
                    <div className="place-review-single-actions">
                      <span className="place-review-photo-count">{nonEmptyImageCount}/5 foto</span>
                      <strong className="place-review-edit-label">{isOpen ? 'Editoru kapat' : 'Duzenle'}</strong>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="place-review-editor">
                    <div className="place-review-raw-grid">
                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Sweep kaynagi</span>
                        <strong>{item.nameRaw || 'Isimsiz mekan'}</strong>
                        <p>{item.sourceName} / {item.sourceId}</p>
                        <p>{item.gridKey || 'Grid yok'} {item.cellId ? `• ${item.cellId}` : ''}</p>
                        <p>Import: {formatDate(item.importedAt)}</p>
                        <p>Durum: {formatProcessingStatus(item.processingStatus)}</p>
                        {item.googleMapsUri ? (
                          <a
                            href={item.googleMapsUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-inline-link"
                          >
                            Kaynagi ac
                          </a>
                        ) : null}
                      </div>

                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Mekan durumu</span>
                        <strong>{formatPlaceStatus(draft.status)}</strong>
                        <p>Dogrulama: {formatVerificationStatus(draft.verificationStatus)}</p>
                        <p>Adres: {draft.address || item.addressRaw || '-'}</p>
                        <p>Telefon: {draft.phone || item.phoneRaw || '-'}</p>
                        <p>Website: {draft.website || item.websiteRaw || '-'}</p>
                      </div>
                    </div>

                    <PlaceEditorForm
                      itemId={item.id}
                      draft={draft}
                      categoryOptions={categoryOptions}
                      photoHint="Sweep mekanlari icin en az 1, en fazla 5 foto URL gir."
                      onUpdateField={(field, value) => updateDraftField(item.id, field, value)}
                      onUpdateImage={(index, value) => updateImageField(item.id, index, value)}
                      onAddImage={() => addImageField(item.id)}
                      onRemoveImage={(index) => removeImageField(item.id, index)}
                      actions={
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => runSweepPlaceAction(item.id, 'save_draft')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Kaydediliyor...' : 'Taslagi kaydet'}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => runSweepPlaceAction(item.id, 'publish')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Yayina hazirlaniyor...' : 'Onayla ve yayinla'}
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => runSweepPlaceAction(item.id, 'reject')}
                            disabled={isBusy}
                          >
                            Reddet
                          </Button>
                          {draft.slug ? (
                            <Link
                              href={`/mekan/${draft.slug}`}
                              target="_blank"
                              className="admin-inline-link"
                            >
                              Public sayfayi ac
                            </Link>
                          ) : null}
                        </>
                      }
                    />
                  </div>
                ) : null}
              </article>
            )
          })}

          {totalPages > 1 ? (
            <div className="admin-pagination">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Onceki Sayfa
              </Button>
              <span className="admin-pagination-label">
                Sayfa {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki Sayfa
              </Button>
            </div>
          ) : null}
        </section>
      )}
    </main>
  )
}
