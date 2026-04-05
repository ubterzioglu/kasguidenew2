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
  const [overpassForm, setOverpassForm] = useState({
    gridX: '1',
    gridY: '1',
    cellSizeMeters: '500',
    regionName: 'Kaş Overpass Sweep',
    dryRun: false,
  })
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
    runOverpassSweep,
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
    <main className="container admin-shell admin-shell-places admin-shell-sweeps">
      <section className="admin-places-intro">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">Sweep Paneli</h1>
          <p className="admin-places-subtitle">
            Sweep oturumlarını takip et, Overpass taraması başlat ve sweep kaynaklı mekanları tek yerden yönet.
          </p>
        </div>
      </section>

      <section className="admin-hero admin-hero-review admin-places-hero-stack">
        <div className="admin-summary-card admin-summary-card-review admin-summary-card-places admin-summary-card-sweeps">
          <div className="admin-summary-item">
            <span className="admin-summary-label">Toplam sweep</span>
            <strong>{snapshot.stats.trackedSweeps}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Çalışan</span>
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
            <span className="admin-summary-label">Yayında</span>
            <strong>{snapshot.stats.publishedSweepPlaces}</strong>
          </div>
        </div>
      </section>

      <section className="admin-toolbar admin-toolbar-places">
        <AdminSectionLinks
          current="sweeps"
          onRefresh={() => loadDashboard()}
          refreshLabel="Sweep listesini yenile"
          refreshing={isLoading}
          onLogout={logout}
        />

        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-panel admin-panel-overpass admin-panel-overpass-places">
        <div className="admin-overpass-head admin-overpass-head-places">
          <div>
            <h2 className="admin-section-title">Overpass sweep başlat</h2>
            <p className="admin-section-copy">
              `overpass-api.de` üzerinden tek hücre sweep çalıştırır ve sonuçları aynı `places` tablosuna yazar.
            </p>
          </div>
        </div>

        <div className="admin-overpass-grid">
          <label className="admin-field">
            <span className="admin-label">Grid X</span>
            <input
              className="admin-input"
              inputMode="numeric"
              value={overpassForm.gridX}
              onChange={(event) => setOverpassForm((current) => ({ ...current, gridX: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Grid Y</span>
            <input
              className="admin-input"
              inputMode="numeric"
              value={overpassForm.gridY}
              onChange={(event) => setOverpassForm((current) => ({ ...current, gridY: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Hücre boyutu (m)</span>
            <input
              className="admin-input"
              inputMode="numeric"
              value={overpassForm.cellSizeMeters}
              onChange={(event) => setOverpassForm((current) => ({ ...current, cellSizeMeters: event.target.value }))}
            />
          </label>

          <label className="admin-field admin-field-span-2">
            <span className="admin-label">Bölge adı</span>
            <input
              className="admin-input"
              value={overpassForm.regionName}
              onChange={(event) => setOverpassForm((current) => ({ ...current, regionName: event.target.value }))}
            />
          </label>
        </div>

        <label className="admin-checkbox-row admin-checkbox-row-places">
          <input
            type="checkbox"
            checked={overpassForm.dryRun}
            onChange={(event) => setOverpassForm((current) => ({ ...current, dryRun: event.target.checked }))}
          />
          <span>Dry-run çalıştır, veri yazma</span>
        </label>

        <div className="admin-toolbar-actions">
          <Button
            type="button"
            variant="primary"
            disabled={isLoading}
            onClick={() =>
              runOverpassSweep({
                gridX: Number.parseInt(overpassForm.gridX, 10) || 1,
                gridY: Number.parseInt(overpassForm.gridY, 10) || 1,
                cellSizeMeters: Number.parseInt(overpassForm.cellSizeMeters, 10) || 500,
                regionName: overpassForm.regionName.trim() || undefined,
                dryRun: overpassForm.dryRun,
              })
            }
          >
            {isLoading ? 'Çalışıyor...' : overpassForm.dryRun ? 'Dry-run başlat' : 'Overpass sweep başlat'}
          </Button>
        </div>
      </section>

      <section className="admin-list-header admin-list-header-places">
        <div>
          <h2 className="admin-section-title">Sweep oturumları</h2>
          <p className="admin-section-copy">
            Burada sadece tarama oturumları ve hücre sonuçları görünür; mekan yönetimi yine tek tablo üzerinden ilerler.
          </p>
        </div>
      </section>

      <SweepBoard sweeps={snapshot.sweeps} />

      <section className="admin-list-header admin-list-header-places">
        <div>
          <h2 className="admin-section-title">Sweep kaynaklı mekanlar</h2>
          <p className="admin-section-copy">
            Bu liste yalnızca `sweeped` etiketli mekanları gösterir. Kayıtlar yine aynı `places` tablosunda kalır.
          </p>
        </div>
      </section>

      {snapshot.sweepPlaces.length === 0 ? (
        <section className="admin-empty-state">
          <strong>Henüz listelenecek sweep mekan yok.</strong>
          <p>Yeni bir sweep tamamlandığında mekanlar burada görünecek.</p>
        </section>
      ) : (
        <section className="place-review-shell place-review-shell-places">
          {paginatedPlaces.map((item) => {
            const isOpen = activeSweepPlaceId === item.id
            const isBusy = activeActionId === item.id
            const draft = drafts[item.id] ?? item.draft
            const nonEmptyImageCount = draft.imageUrls.map((entry) => entry.trim()).filter(Boolean).length
            const placeTone = mapProcessingStatusTone(draft.status)

            return (
              <article key={item.id} className={`place-review-card place-review-card-places${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="place-review-summary"
                  onClick={() => setActiveSweepPlaceId(isOpen ? null : item.id)}
                >
                  <div className="place-review-row-grid place-review-row-grid-places">
                    <span className="place-review-grid-pill place-review-grid-pill-places">{item.gridKey || item.sourceName || 'Sweep'}</span>
                    <h3 className="place-review-single-title">{draft.name || item.nameRaw || 'İsimsiz mekan'}</h3>
                    <span className="place-review-single-cat">{draft.categoryPrimary || item.categoryRaw || 'Kategori yok'}</span>
                    <div className="place-review-single-actions place-review-single-actions-inline place-review-single-actions-inline-row">
                      <span className={`review-pill review-pill-${placeTone}`}>{formatPlaceStatus(draft.status)}</span>
                      <span className="review-pill review-pill-pending">Sweeped</span>
                      <span className="place-review-photo-count">{nonEmptyImageCount}/5 foto</span>
                      <strong className="place-review-edit-label">{isOpen ? 'Editörü kapat' : 'Düzenle'}</strong>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="place-review-editor">
                    <div className="place-review-raw-grid">
                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Sweep kaynağı</span>
                        <strong>{item.nameRaw || 'İsimsiz mekan'}</strong>
                        <p>{item.sourceName} / {item.sourceId}</p>
                        <p>{item.gridKey || 'Grid yok'}{item.cellId ? ` • ${item.cellId}` : ''}</p>
                        <p>Import: {formatDate(item.importedAt)}</p>
                        <p>Durum: {formatProcessingStatus(item.processingStatus)}</p>
                        {item.googleMapsUri ? (
                          <a
                            href={item.googleMapsUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-inline-link"
                          >
                            Kaynağı aç
                          </a>
                        ) : null}
                      </div>

                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Mekan durumu</span>
                        <strong>{formatPlaceStatus(draft.status)}</strong>
                        <p>Doğrulama: {formatVerificationStatus(draft.verificationStatus)}</p>
                        <p>Adres: {draft.address || item.addressRaw || '-'}</p>
                        <p>Telefon: {draft.phone || item.phoneRaw || '-'}</p>
                        <p>Website: {draft.website || item.websiteRaw || '-'}</p>
                      </div>
                    </div>

                    <PlaceEditorForm
                      itemId={item.id}
                      draft={draft}
                      categoryOptions={categoryOptions}
                      photoHint="Sweep mekanları için en az 1, en fazla 5 foto URL gir."
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
                            {isBusy ? 'Kaydediliyor...' : 'Taslağı kaydet'}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => runSweepPlaceAction(item.id, 'publish')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Yayına hazırlanıyor...' : 'Onayla ve yayınla'}
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
                              Public sayfayı aç
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
                Önceki Sayfa
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
