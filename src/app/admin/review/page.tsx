'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useReviewDashboard } from './useReviewDashboard'
import { AdminHero } from './components/AdminHero'
import { PlaceEditorForm } from './components/PlaceEditorForm'
import { SweepBoard } from './components/SweepBoard'
import { Button } from '@/components/ui/button'
import { formatDate, formatPlaceStatus, formatVerificationStatus } from './formatters'

export default function ReviewAdminPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const {
    snapshot,
    drafts,
    existingPlaces,
    existingDrafts,
    status,
    isLoading,
    activeActionId,
    activeRawPlaceId,
    setActiveRawPlaceId,
    activeExistingPlaceId,
    setActiveExistingPlaceId,
    loadDashboard,
    runRawPlaceAction,
    runExistingPlaceAction,
    updateDraftField,
    updateImageField,
    addImageField,
    removeImageField,
    updateExistingDraftField,
    updateExistingImageField,
    addExistingImageField,
    removeExistingImageField,
    logout,
  } = useReviewDashboard()

  const totalPages = Math.ceil(snapshot.rawResults.length / itemsPerPage)
  const paginatedRawResults = snapshot.rawResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const categoryOptions = snapshot.categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))

  return (
    <main className="container admin-shell">
      <AdminHero stats={snapshot.stats} />

      <section className="admin-toolbar">
        <div className="admin-panel admin-panel-links admin-panel-review">
          <div className="admin-toolbar-actions">
            <Button type="button" variant="primary" onClick={() => loadDashboard()} disabled={isLoading}>
              {isLoading ? 'Yukleniyor...' : 'Paneli yenile'}
            </Button>
            <Link href="/admin" className="admin-button admin-button-secondary admin-button-link">
              Admin ana sayfa
            </Link>
            <Button type="button" variant="secondary" onClick={logout}>
              Cikis yap
            </Button>
          </div>
        </div>

        <div className={`admin-status admin-status-${status.tone}`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Grid sweep gecmisi</h2>
          <p className="admin-section-copy">
            Hangi kare tarandi, kac mekan cekildi ve sweep durumunun ne oldugu burada gorunur.
          </p>
        </div>
      </section>
      <SweepBoard sweeps={snapshot.sweeps} />

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Sweep edilen mekanlar</h2>
          <p className="admin-section-copy">
            Ham Google verisini gorup kategori, mekan basligi, aciklama ve fotograflari duzenleyebilirsin.
          </p>
        </div>
      </section>

      {snapshot.rawResults.length === 0 ? (
        <section className="admin-empty-state">
          <strong>Henuz listelenecek mekan yok.</strong>
          <p>Yeni bir grid sweep tamamlandiginda mekan editoru burada dolacak.</p>
        </section>
      ) : (
        <section className="place-review-shell">
          {paginatedRawResults.map((item) => {
            const isOpen = activeRawPlaceId === item.id
            const isBusy = activeActionId === item.id
            const draft = drafts[item.id] ?? item.draft
            const nonEmptyImageCount = draft.imageUrls.map((entry) => entry.trim()).filter(Boolean).length
            const placeTone =
              draft.status === 'published'
                ? 'approved'
                : draft.status === 'archived'
                  ? 'rejected'
                  : 'in_review'

            return (
              <article key={item.id} className={`place-review-card${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="place-review-summary"
                  onClick={() => setActiveRawPlaceId(isOpen ? null : item.id)}
                >
                  <div className="place-review-row-grid">
                    <span className="place-review-grid-pill">{item.gridKey || 'Grid yok'}</span>
                    <h3 className="place-review-single-title">{draft.name || item.nameRaw || 'Isimsiz mekan'}</h3>
                    <span className="place-review-single-cat">
                      {draft.categoryPrimary || item.categoryRaw || 'Kategori yok'}
                    </span>
                    <span className="place-review-single-address">
                      {draft.address || item.addressRaw || 'Adres yok'}
                    </span>
                    <span className={`review-pill review-pill-${placeTone}`}>
                      {formatPlaceStatus(draft.status)}
                    </span>
                    <div className="place-review-single-actions">
                      <span className="place-review-photo-count">{nonEmptyImageCount}/5 foto</span>
                      <strong className="place-review-edit-label">
                        {isOpen ? 'Editoru kapat' : 'Duzenle'}
                      </strong>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="place-review-editor">
                    <div className="place-review-raw-grid">
                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Google kaynagi</span>
                        <strong>{item.nameRaw || 'Isimsiz mekan'}</strong>
                        <p>{item.categoryRaw || 'Kategori yok'}</p>
                        <p>{item.addressRaw || 'Adres yok'}</p>
                        <p>{item.phoneRaw || 'Telefon yok'}</p>
                        <p>{item.websiteRaw || 'Website yok'}</p>
                        {item.googleMapsUri ? (
                          <a
                            href={item.googleMapsUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-inline-link"
                          >
                            Google Maps kaydini ac
                          </a>
                        ) : null}
                      </div>

                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Yayin durumu</span>
                        <strong>{formatPlaceStatus(draft.status)}</strong>
                        <p>Dogrulama: {formatVerificationStatus(draft.verificationStatus)}</p>
                        <p>
                          Kaynak: {item.sourceName} / {item.sourceId}
                        </p>
                        <p>
                          Koordinat:{' '}
                          {item.lat !== null && item.lng !== null
                            ? `${item.lat.toFixed(6)}, ${item.lng.toFixed(6)}`
                            : 'Yok'}
                        </p>
                      </div>
                    </div>

                    <PlaceEditorForm
                      itemId={item.id}
                      draft={draft}
                      categoryOptions={categoryOptions}
                      photoHint="Her mekan icin en az 1, en fazla 5 foto URL gir. Ilk foto kapak olarak kullanilir."
                      onUpdateField={(field, value) => updateDraftField(item.id, field, value)}
                      onUpdateImage={(index, value) => updateImageField(item.id, index, value)}
                      onAddImage={() => addImageField(item.id)}
                      onRemoveImage={(index) => removeImageField(item.id, index)}
                      actions={
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => runRawPlaceAction(item.id, 'save_draft')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Kaydediliyor...' : 'Taslagi kaydet'}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => runRawPlaceAction(item.id, 'publish')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Yayina hazirlaniyor...' : 'Onayla ve yayina al'}
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => runRawPlaceAction(item.id, 'reject')}
                            disabled={isBusy}
                          >
                            Reddet
                          </Button>
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

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Mevcut mekanlar</h2>
          <p className="admin-section-copy">
            Yayinlanan veya taslak tum mekanlari burada duzenleyebilir, detay alanlari ve fotograf
            hucreleri ekleyebilirsin.
          </p>
        </div>
      </section>

      {existingPlaces.length === 0 ? (
        <section className="admin-empty-state">
          <strong>Duzenlenecek mevcut mekan bulunamadi.</strong>
          <p>Veri tabaninda mekanlar olustukca bu liste otomatik dolar.</p>
        </section>
      ) : (
        <section className="place-review-shell">
          {existingPlaces.map((item) => {
            const isOpen = activeExistingPlaceId === item.id
            const isBusy = activeActionId === item.id
            const draft = existingDrafts[item.id] ?? item.draft
            const nonEmptyImageCount = draft.imageUrls.map((entry) => entry.trim()).filter(Boolean).length
            const placeTone =
              draft.status === 'published'
                ? 'approved'
                : draft.status === 'archived'
                  ? 'rejected'
                  : 'in_review'

            return (
              <article key={item.id} className={`place-review-card${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="place-review-summary"
                  onClick={() => setActiveExistingPlaceId(isOpen ? null : item.id)}
                >
                  <div className="place-review-row-grid">
                    <span className="place-review-grid-pill">{formatDate(item.updatedAt)}</span>
                    <h3 className="place-review-single-title">{draft.name || 'Isimsiz mekan'}</h3>
                    <span className="place-review-single-cat">{draft.categoryPrimary || 'Kategori yok'}</span>
                    <span className="place-review-single-address">{draft.address || 'Adres yok'}</span>
                    <span className={`review-pill review-pill-${placeTone}`}>
                      {formatPlaceStatus(draft.status)}
                    </span>
                    <div className="place-review-single-actions">
                      <span className="place-review-photo-count">{nonEmptyImageCount}/5 foto</span>
                      <strong className="place-review-edit-label">
                        {isOpen ? 'Editoru kapat' : 'Duzenle'}
                      </strong>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="place-review-editor">
                    <div className="place-review-raw-grid">
                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Mekan kimligi</span>
                        <strong>{draft.name || 'Isimsiz mekan'}</strong>
                        <p>Slug: {draft.slug || '-'}</p>
                        <p>Kategori: {draft.categoryPrimary || '-'}</p>
                        <p>Adres: {draft.address || '-'}</p>
                        <p>Telefon: {draft.phone || '-'}</p>
                      </div>

                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Yayin durumu</span>
                        <strong>{formatPlaceStatus(draft.status)}</strong>
                        <p>Dogrulama: {formatVerificationStatus(draft.verificationStatus)}</p>
                        <p>Website: {draft.website || '-'}</p>
                        <p>Guncelleme: {formatDate(item.updatedAt)}</p>
                      </div>
                    </div>

                    <PlaceEditorForm
                      itemId={item.id}
                      draft={draft}
                      categoryOptions={categoryOptions}
                      photoHint="Detay sayfasi hucreleri icin en az 1, en fazla 5 foto URL gir."
                      onUpdateField={(field, value) => updateExistingDraftField(item.id, field, value)}
                      onUpdateImage={(index, value) => updateExistingImageField(item.id, index, value)}
                      onAddImage={() => addExistingImageField(item.id)}
                      onRemoveImage={(index) => removeExistingImageField(item.id, index)}
                      actions={
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => runExistingPlaceAction(item.id, 'save')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Kaydediliyor...' : 'Degisiklikleri kaydet'}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => runExistingPlaceAction(item.id, 'publish')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Yayina hazirlaniyor...' : 'Yayina al'}
                          </Button>
                        </>
                      }
                    />
                  </div>
                ) : null}
              </article>
            )
          })}
        </section>
      )}

    </main>
  )
}
