'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

import { AdminSectionLinks } from '../components/AdminSectionLinks'
import { PlaceEditorForm } from '../review/components/PlaceEditorForm'
import { formatDate, formatPlaceStatus, formatVerificationStatus } from '../review/formatters'
import { usePlacesDashboard } from './usePlacesDashboard'

type FilterMode = 'all' | 'published' | 'draft' | 'sweeped'

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
      case 'sweeped':
        return snapshot.places.filter((item) => item.isSweeped)
      default:
        return snapshot.places
    }
  }, [drafts, filter, snapshot.places])

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / itemsPerPage))
  const paginatedPlaces = filteredPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const categoryOptions = snapshot.categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))

  return (
    <main className="container admin-shell">
      <section className="admin-hero admin-hero-review">
        <div className="admin-summary-card admin-summary-card-review">
          <div className="admin-summary-item">
            <span className="admin-summary-label">Toplam mekan</span>
            <strong>{snapshot.stats.totalPlaces}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Yayinda</span>
            <strong>{snapshot.stats.publishedPlaces}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Taslak / admin</span>
            <strong>{snapshot.stats.draftPlaces}</strong>
          </div>
          <div className="admin-summary-item">
            <span className="admin-summary-label">Sweeped</span>
            <strong>{snapshot.stats.sweepedPlaces}</strong>
          </div>
        </div>
      </section>

      <section className="admin-toolbar">
        <AdminSectionLinks
          current="places"
          onRefresh={() => loadDashboard()}
          refreshLabel="Mekan panelini yenile"
          refreshing={isLoading}
          onLogout={logout}
        />

        <div className={`admin-status admin-status-${status.tone}`}>
          <span>{status.message}</span>
        </div>
      </section>

      <section className="admin-list-header">
        <div>
          <h2 className="admin-section-title">Mekanlar</h2>
          <p className="admin-section-copy">
            Tum mekanlar tek tabloda yonetilir. Sweep kaynakli mekanlar da burada `sweeped` etiketiyle gorunur.
          </p>
        </div>
        <div className="admin-toolbar-actions">
          <Button type="button" variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => { setFilter('all'); setCurrentPage(1) }}>
            Tumu
          </Button>
          <Button type="button" variant={filter === 'published' ? 'primary' : 'secondary'} onClick={() => { setFilter('published'); setCurrentPage(1) }}>
            Yayinda
          </Button>
          <Button type="button" variant={filter === 'draft' ? 'primary' : 'secondary'} onClick={() => { setFilter('draft'); setCurrentPage(1) }}>
            Taslak
          </Button>
          <Button type="button" variant={filter === 'sweeped' ? 'primary' : 'secondary'} onClick={() => { setFilter('sweeped'); setCurrentPage(1) }}>
            Sweeped
          </Button>
        </div>
      </section>

      {filteredPlaces.length === 0 ? (
        <section className="admin-empty-state">
          <strong>Bu filtre icin mekan bulunamadi.</strong>
          <p>Filtreyi degistirerek farkli bir mekan listesi gorebilirsin.</p>
        </section>
      ) : (
        <section className="place-review-shell">
          {paginatedPlaces.map((item) => {
            const isOpen = activePlaceId === item.id
            const isBusy = activeActionId === item.id
            const draft = drafts[item.id] ?? item.draft
            const nonEmptyImageCount = draft.imageUrls.map((entry) => entry.trim()).filter(Boolean).length

            return (
              <article key={item.id} className={`place-review-card${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="place-review-summary"
                  onClick={() => setActivePlaceId(isOpen ? null : item.id)}
                >
                  <div className="place-review-row-grid">
                    <span className="place-review-grid-pill">{formatDate(item.updatedAt)}</span>
                    <h3 className="place-review-single-title">{draft.name || 'Isimsiz mekan'}</h3>
                    <span className="place-review-single-cat">{draft.categoryPrimary || 'Kategori yok'}</span>
                    <span className="place-review-single-address">{draft.address || 'Adres yok'}</span>
                    <div className="place-review-single-actions">
                      <span className={`review-pill review-pill-${draft.status === 'published' ? 'approved' : 'in_review'}`}>
                        {formatPlaceStatus(draft.status)}
                      </span>
                      {item.isSweeped ? <span className="review-pill review-pill-pending">Sweeped</span> : null}
                      <span className="place-review-photo-count">{nonEmptyImageCount}/5 foto</span>
                      <strong className="place-review-edit-label">{isOpen ? 'Editoru kapat' : 'Duzenle'}</strong>
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
                        <p>Guncelleme: {formatDate(item.updatedAt)}</p>
                        <p>Koken: {item.intakeChannel}</p>
                        {item.sourceName ? <p>Kaynak: {item.sourceName} / {item.sourceId || '-'}</p> : null}
                      </div>

                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Yayin durumu</span>
                        <strong>{formatPlaceStatus(draft.status)}</strong>
                        <p>Dogrulama: {formatVerificationStatus(draft.verificationStatus)}</p>
                        <p>Website: {draft.website || '-'}</p>
                        <p>Telefon: {draft.phone || '-'}</p>
                        <p>{item.isSweeped ? 'Bu mekan sweep kaynaklidir.' : 'Bu mekan manuel veya legacy kayittir.'}</p>
                      </div>
                    </div>

                    <PlaceEditorForm
                      itemId={item.id}
                      draft={draft}
                      categoryOptions={categoryOptions}
                      photoHint="Detay sayfasi icin en az 1, en fazla 5 foto URL gir."
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
                            {isBusy ? 'Kaydediliyor...' : 'Degisiklikleri kaydet'}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => runPlaceAction(item.id, 'publish')}
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
