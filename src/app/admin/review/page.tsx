'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useReviewDashboard } from './useReviewDashboard'
import { AdminHero } from './components/AdminHero'
import { SweepBoard } from './components/SweepBoard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import {
  formatDate,
  formatPlaceStatus,
  formatVerificationStatus,
} from './formatters'

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
                      <span style={{ fontSize: '0.8rem', color: '#35c8b4' }}>{nonEmptyImageCount}/5 foto</span>
                      <strong style={{ fontSize: '0.85rem', color: isOpen ? '#fff' : '#35c8b4' }}>
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

                    <div className="place-editor-grid">
                      <Input
                        label="Mekan adi"
                        value={draft.name}
                        onChange={(event) => updateDraftField(item.id, 'name', event.target.value)}
                      />

                      <Input
                        label="Mekan basligi"
                        value={draft.headline}
                        onChange={(event) => updateDraftField(item.id, 'headline', event.target.value)}
                      />

                      <Textarea
                        label="Kisa aciklama"
                        isWide
                        rows={3}
                        value={draft.shortDescription}
                        onChange={(event) => updateDraftField(item.id, 'shortDescription', event.target.value)}
                      />

                      <Textarea
                        label="Detayli aciklama"
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
                          <h4>Fotograflar</h4>
                          <p>Her mekan icin en az 1, en fazla 5 foto URL gir. Ilk foto kapak olarak kullanilir.</p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => addImageField(item.id)}
                          disabled={draft.imageUrls.length >= 5}
                        >
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
                              Kaldir
                            </Button>
                            {imageUrl.trim() ? (
                              <img src={imageUrl} alt="Onizleme" className="place-photo-preview" />
                            ) : (
                              <div className="place-photo-placeholder">Onizleme yok</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="place-editor-actions">
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
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}

          {totalPages > 1 ? (
            <div
              className="admin-pagination"
              style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Onceki Sayfa
              </Button>
              <span style={{ color: '#fff', alignSelf: 'center' }}>
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
                      <span style={{ fontSize: '0.8rem', color: '#35c8b4' }}>{nonEmptyImageCount}/5 foto</span>
                      <strong style={{ fontSize: '0.85rem', color: isOpen ? '#fff' : '#35c8b4' }}>
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

                    <div className="place-editor-grid">
                      <Input
                        label="Mekan adi"
                        value={draft.name}
                        onChange={(event) => updateExistingDraftField(item.id, 'name', event.target.value)}
                      />

                      <Input
                        label="Mekan basligi"
                        value={draft.headline}
                        onChange={(event) => updateExistingDraftField(item.id, 'headline', event.target.value)}
                      />

                      <Textarea
                        label="Kisa aciklama"
                        isWide
                        rows={3}
                        value={draft.shortDescription}
                        onChange={(event) =>
                          updateExistingDraftField(item.id, 'shortDescription', event.target.value)
                        }
                      />

                      <Textarea
                        label="Detayli aciklama"
                        isWide
                        rows={5}
                        value={draft.longDescription}
                        onChange={(event) =>
                          updateExistingDraftField(item.id, 'longDescription', event.target.value)
                        }
                      />

                      <Select
                        label="Kategori"
                        value={draft.categoryPrimary}
                        onChange={(event) =>
                          updateExistingDraftField(item.id, 'categoryPrimary', event.target.value)
                        }
                        options={snapshot.categoryOptions.map((opt) => ({ value: opt.id, label: opt.label }))}
                      />

                      <Input
                        label="Website"
                        value={draft.website}
                        onChange={(event) => updateExistingDraftField(item.id, 'website', event.target.value)}
                        placeholder="https://..."
                      />

                      <Input
                        label="Adres"
                        isWide
                        value={draft.address}
                        onChange={(event) => updateExistingDraftField(item.id, 'address', event.target.value)}
                      />

                      <Input
                        label="Telefon"
                        value={draft.phone}
                        onChange={(event) => updateExistingDraftField(item.id, 'phone', event.target.value)}
                      />
                    </div>

                    <div className="place-photo-panel">
                      <div className="place-photo-header">
                        <div>
                          <h4>Fotograflar</h4>
                          <p>Detay sayfasi hucreleri icin en az 1, en fazla 5 foto URL gir.</p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => addExistingImageField(item.id)}
                          disabled={draft.imageUrls.length >= 5}
                        >
                          Foto ekle
                        </Button>
                      </div>

                      <div className="place-photo-list">
                        {draft.imageUrls.map((imageUrl, index) => (
                          <div key={`${item.id}-existing-image-${index}`} className="place-photo-row">
                            <Input
                              label={`Foto URL #${index + 1}`}
                              isWide
                              value={imageUrl}
                              onChange={(event) =>
                                updateExistingImageField(item.id, index, event.target.value)
                              }
                              placeholder="https://..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeExistingImageField(item.id, index)}
                            >
                              Kaldir
                            </Button>
                            {imageUrl.trim() ? (
                              <img src={imageUrl} alt="Onizleme" className="place-photo-preview" />
                            ) : (
                              <div className="place-photo-placeholder">Onizleme yok</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="place-editor-actions">
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
                    </div>
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
