'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CATEGORIES, CATEGORY_GROUPS } from '@/lib/categories'

import { AdminSectionLinks } from '../components/AdminSectionLinks'
import { PlaceEditorForm } from '../review/components/PlaceEditorForm'
import { formatCompactDate, formatDate, formatPlaceStatus } from '../review/formatters'
import { usePlacesDashboard } from './usePlacesDashboard'

type FilterMode = 'all' | 'published' | 'draft'

export default function AdminPlacesPage() {
  const [filter, setFilter] = useState<FilterMode>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
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
    let result = snapshot.places

    switch (filter) {
      case 'published':
        result = result.filter((item) => (drafts[item.id] ?? item.draft).status === 'published')
        break
      case 'draft':
        result = result.filter((item) => (drafts[item.id] ?? item.draft).status !== 'published')
        break
    }

    if (categoryFilter) {
      result = result.filter((item) => {
        const draft = drafts[item.id] ?? item.draft
        return draft.categoryIds.includes(categoryFilter)
      })
    }

    return result
  }, [drafts, filter, categoryFilter, snapshot.places])

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / itemsPerPage))
  const paginatedPlaces = filteredPlaces.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const categoryOptions = snapshot.categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))
  const badgeOptions = snapshot.badgeOptions.map((opt) => ({ value: opt.id, label: opt.label }))
  const categoryLabelMap = useMemo(
    () => new Map(snapshot.categoryOptions.map((option) => [option.id, option.label])),
    [snapshot.categoryOptions],
  )

  const formatCategorySummary = (categoryIds: string[]) => {
    if (categoryIds.length === 0) {
      return 'Kategori yok'
    }

    return categoryIds
      .map((categoryId) => categoryLabelMap.get(categoryId) ?? categoryId)
      .join(', ')
  }

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

          <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
            <span>{status.message}</span>
          </div>
        </div>
      </section>

      <section className="admin-toolbar-actions admin-places-filterbar admin-places-filterbar-panel">
        <Button type="button" variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => { setFilter('all'); setCurrentPage(1) }}>
          Tümü
        </Button>
        <Button type="button" variant={filter === 'published' ? 'primary' : 'secondary'} onClick={() => { setFilter('published'); setCurrentPage(1) }}>
          Yayında
        </Button>
        <Button type="button" variant={filter === 'draft' ? 'primary' : 'secondary'} onClick={() => { setFilter('draft'); setCurrentPage(1) }}>
          Taslak
        </Button>

        <select
          value={categoryFilter ?? ''}
          onChange={(e) => {
            setCategoryFilter(e.target.value || null)
            setCurrentPage(1)
          }}
          className="admin-category-select"
        >
          <option value="">Tüm kategoriler</option>
          {CATEGORY_GROUPS.map((group) => (
            <optgroup key={group.title} label={group.title}>
              {group.ids.map((id) => {
                const cat = CATEGORIES.find((c) => c.id === id)
                return cat ? (
                  <option key={id} value={id}>{cat.icon} {cat.label}</option>
                ) : null
              })}
            </optgroup>
          ))}
          {CATEGORIES.filter((c) => c.group === null).map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
          ))}
        </select>
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

            return (
              <article key={item.id} className={`place-review-card place-review-card-places${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="place-review-summary"
                  onClick={() => setActivePlaceId(isOpen ? null : item.id)}
                >
                  <div className="place-review-row-grid place-review-row-grid-places">
                    <span className="place-review-grid-pill place-review-grid-pill-places">{formatCompactDate(item.updatedAt)}</span>
                    <h3 className="place-review-single-title">{draft.name || 'İsimsiz mekan'}</h3>
                    <span className="place-review-single-cat">{formatCategorySummary(draft.categoryIds)}</span>
                    <div className="place-review-single-actions place-review-single-actions-inline place-review-single-actions-inline-row">
                      <span className={`review-pill review-pill-${draft.status === 'published' ? 'approved' : 'in_review'}`}>
                        {formatPlaceStatus(draft.status)}
                      </span>
                      <strong className="place-review-edit-label">{isOpen ? 'Editörü kapat' : 'Düzenle'}</strong>
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="place-review-editor">
                    <div className="place-review-raw-grid">
                      <div className="place-review-raw-card">
                        <span className="place-review-card-label">Mekan özeti</span>
                        <strong>{draft.name || 'İsimsiz mekan'}</strong>
                        <p>Kategoriler: {formatCategorySummary(draft.categoryIds)}</p>
                        <p>Güncelleme: {formatDate(item.updatedAt)}</p>
                        <p>Köken: {item.intakeChannel}{item.intakeChannel === 'user_submission' ? ' (Kullanıcı Önerisi)' : ''}</p>
                        {item.sourceName ? <p>Kaynak: {item.sourceName} / {item.sourceId || '-'}</p> : null}
                      </div>
                    </div>

                    <PlaceEditorForm
                      itemId={item.id}
                      draft={draft}
                      categoryOptions={categoryOptions}
                      badgeOptions={badgeOptions}
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
                            onClick={() => runPlaceAction(item.id)}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
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
