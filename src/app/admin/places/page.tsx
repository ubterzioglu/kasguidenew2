'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import { AdminSectionLinks } from '../components/AdminSectionLinks'
import { PlaceEditorForm } from '../review/components/PlaceEditorForm'
import { formatDate, formatPlaceStatus, formatVerificationStatus } from '../review/formatters'
import { usePlacesDashboard } from './usePlacesDashboard'

type FilterMode = 'all' | 'published' | 'draft'

export default function AdminPlacesPage() {
  const [filter, setFilter] = useState<FilterMode>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  const {
    snapshot,
    drafts,
    status,
    isLoading,
    activeActionId,
    activePlaceId,
    setActivePlaceId,
    loadDashboard,
    runPlaceAction,
    updateDraftField,
    updateImageField,
    addImageField,
    removeImageField,
    logout,
  } = usePlacesDashboard()

  const filteredPlaces = useMemo(() => {
    switch (filter) {
      case 'published':
        return snapshot.places.filter((item) => (drafts[item.id] ?? item.draft).status === 'published')
      case 'draft':
        return snapshot.places.filter((item) => (drafts[item.id] ?? item.draft).status !== 'published')
      default:
        return snapshot.places
    }
  }, [drafts, filter, snapshot.places])

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / itemsPerPage))
  const paginatedPlaces = filteredPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const categoryOptions = snapshot.categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))

  return (
    <main className="container admin-shell admin-shell-places">
      <section className="admin-places-intro admin-places-header-panel">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">Admin Paneli</h1>
          <p className="admin-places-subtitle">
            Mekanları tek listede yönet, filtrele ve yayına hazır hale getir.
          </p>
        </div>

        <div className="admin-places-header-actions">
          <AdminSectionLinks
            current="places"
            onRefresh={() => loadDashboard()}
            refreshLabel="Listeyi yenile"
            refreshing={isLoading}
            onLogout={logout}
          />

          <div className="admin-toolbar-actions admin-places-filterbar admin-places-filterbar-header">
            <Button type="button" variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => { setFilter('all'); setCurrentPage(1) }}>
              Tümü
            </Button>
            <Button type="button" variant={filter === 'published' ? 'primary' : 'secondary'} onClick={() => { setFilter('published'); setCurrentPage(1) }}>
              Yayında
            </Button>
            <Button type="button" variant={filter === 'draft' ? 'primary' : 'secondary'} onClick={() => { setFilter('draft'); setCurrentPage(1) }}>
              Taslak
            </Button>
          </div>

          <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
            <span>{status.message}</span>
          </div>
        </div>
      </section>

      <section className="admin-hero admin-hero-review admin-places-hero-stack">
        <div className="admin-summary-card admin-summary-card-review admin-summary-card-places">
          <div className="admin-summary-item">
            <span className="admin-summary-label">Toplam mekan</span>
            <strong>{snapshot.stats.totalPlaces}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Yayında</span>
            <strong>{snapshot.stats.publishedPlaces}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Taslak / admin</span>
            <strong>{snapshot.stats.draftPlaces}</strong>
          </div>
        </div>
      </section>

      <section className="admin-list-header admin-list-header-places">
        <div>
          <h2 className="admin-section-title">Mekan Listesi</h2>
        </div>
      </section>

      {filteredPlaces.length === 0 ? (
        <section className="admin-empty-state">
          <strong>Bu filtre için mekan bulunamadı.</strong>
          <p>Filtreyi değiştirerek farklı bir mekan listesi görebilirsin.</p>
        </section>
      ) : (
        <section className="place-review-shell place-review-shell-places">
          {paginatedPlaces.map((item) => {
            const isOpen = activePlaceId === item.id
            const isBusy = activeActionId === item.id
            const draft = drafts[item.id] ?? item.draft
            const nonEmptyImageCount = draft.imageUrls.map((entry) => entry.trim()).filter(Boolean).length

            return (
              <article key={item.id} className={`place-review-card place-review-card-places${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="place-review-summary"
                  onClick={() => setActivePlaceId(isOpen ? null : item.id)}
                >
                  <div className="place-review-row-grid place-review-row-grid-places">
                    <span className="place-review-grid-pill place-review-grid-pill-places">{formatDate(item.updatedAt)}</span>
                    <h3 className="place-review-single-title">{draft.name || 'İsimsiz mekan'}</h3>
                    <span className="place-review-single-cat">{draft.categoryPrimary || 'Kategori yok'}</span>
                    <div className="place-review-single-actions place-review-single-actions-inline">
                      <span className={`review-pill review-pill-${draft.status === 'published' ? 'approved' : 'in_review'}`}>
                        {formatPlaceStatus(draft.status)}
                      </span>
                      <span className="place-review-photo-count">{nonEmptyImageCount}/5 foto</span>
                      <strong className="place-review-edit-label">{isOpen ? 'Editörü kapat' : 'Düzenle'}</strong>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="place-review-editor">
                    <div className="place-review-raw-grid">
                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Mekan kimliği</span>
                        <strong>{draft.name || 'İsimsiz mekan'}</strong>
                        <p>Slug: {draft.slug || '-'}</p>
                        <p>Kategori: {draft.categoryPrimary || '-'}</p>
                        <p>Güncelleme: {formatDate(item.updatedAt)}</p>
                        <p>Köken: {item.intakeChannel}</p>
                        {item.sourceName ? <p>Kaynak: {item.sourceName} / {item.sourceId || '-'}</p> : null}
                      </div>

                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Yayın durumu</span>
                        <strong>{formatPlaceStatus(draft.status)}</strong>
                        <p>Doğrulama: {formatVerificationStatus(draft.verificationStatus)}</p>
                        <p>Website: {draft.website || '-'}</p>
                        <p>Telefon: {draft.phone || '-'}</p>
                      </div>
                    </div>

                    <PlaceEditorForm
                      itemId={item.id}
                      draft={draft}
                      categoryOptions={categoryOptions}
                      photoHint="Detay sayfası için en az 1, en fazla 5 foto URL gir."
                      onUpdateField={(field, value) => updateDraftField(item.id, field, value)}
                      onUpdateImage={(index, value) => updateImageField(item.id, index, value)}
                      onAddImage={() => addImageField(item.id)}
                      onRemoveImage={(index) => removeImageField(item.id, index)}
                      actions={
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => runPlaceAction(item.id, 'save')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => runPlaceAction(item.id, 'publish')}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Yayına hazırlanıyor...' : 'Yayına al'}
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
