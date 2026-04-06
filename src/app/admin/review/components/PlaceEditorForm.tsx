'use client'

import type { PlaceEditorDraft } from '@/types/review'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type PlaceEditorFormProps = {
  itemId: string
  draft: PlaceEditorDraft
  categoryOptions: { value: string; label: string }[]
  badgeOptions: { value: string; label: string }[]
  photoHint: string
  onUpdateField: <K extends keyof PlaceEditorDraft>(field: K, value: PlaceEditorDraft[K]) => void
  onUpdateImage: (index: number, value: string) => void
  onAddImage: () => void
  onRemoveImage: (index: number) => void
  actions: React.ReactNode
}

export function PlaceEditorForm({
  itemId,
  draft,
  categoryOptions,
  badgeOptions,
  photoHint,
  onUpdateField,
  onUpdateImage,
  onAddImage,
  onRemoveImage,
  actions,
}: PlaceEditorFormProps) {
  const toggleArrayValue = (field: 'categoryIds' | 'kasguideBadges', value: string) => {
    const currentValues = draft[field]
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]

    onUpdateField(field, nextValues)
  }

  return (
    <>
      <div className="place-editor-grid">
        <Input
          label="Mekan adi"
          value={draft.name}
          onChange={(event) => onUpdateField('name', event.target.value)}
        />

        <label className="admin-field place-editor-publish-toggle">
          <span>Yayin durumu</span>
          <span className="place-editor-checkbox-row">
            <input
              type="checkbox"
              checked={draft.status === 'published'}
              onChange={(event) => {
                const isPublished = event.target.checked
                onUpdateField('status', isPublished ? 'published' : 'admin')
                onUpdateField('verificationStatus', isPublished ? 'verified' : 'reviewed')
              }}
            />
            <span>Yayinda</span>
          </span>
        </label>

        <div className="place-editor-stack">
          <Textarea
            label="Kisa aciklama"
            rows={3}
            value={draft.shortDescription}
            onChange={(event) => onUpdateField('shortDescription', event.target.value)}
          />

          <Textarea
            label="Detayli aciklama"
            rows={5}
            value={draft.longDescription}
            onChange={(event) => onUpdateField('longDescription', event.target.value)}
          />
        </div>

        <div className="place-editor-stack">
          <Input
            label="Adres"
            value={draft.address}
            onChange={(event) => onUpdateField('address', event.target.value)}
          />

          <Input
            label="Website"
            value={draft.website}
            onChange={(event) => onUpdateField('website', event.target.value)}
            placeholder="https://..."
          />

          <Input
            label="Telefon"
            value={draft.phone}
            onChange={(event) => onUpdateField('phone', event.target.value)}
          />
        </div>

        <fieldset className="place-editor-choice-group">
          <legend>Kategoriler</legend>
          <div className="place-editor-choice-list">
            {categoryOptions.map((option) => (
              <label key={option.value} className="place-editor-choice-item">
                <input
                  type="checkbox"
                  checked={draft.categoryIds.includes(option.value)}
                  onChange={() => toggleArrayValue('categoryIds', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="place-editor-choice-group">
          <legend>Kasguide badge</legend>
          <div className="place-editor-choice-list">
            {badgeOptions.map((option) => (
              <label key={option.value} className="place-editor-choice-item">
                <input
                  type="checkbox"
                  checked={draft.kasguideBadges.includes(option.value)}
                  onChange={() => toggleArrayValue('kasguideBadges', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="place-photo-panel">
        <div className="place-photo-header">
          <div>
            <h4>Fotograflar</h4>
            <p>{photoHint}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onAddImage}
            disabled={draft.imageUrls.length >= 5}
          >
            Foto ekle
          </Button>
        </div>

        <div className="place-photo-list">
          {draft.imageUrls.map((imageUrl, index) => (
            <div key={`${itemId}-image-${index}`} className="place-photo-row">
              <div className="place-photo-input-stack">
                <Input
                  label={`Foto URL #${index + 1}`}
                  isWide
                  value={imageUrl}
                  onChange={(event) => onUpdateImage(index, event.target.value)}
                  placeholder="https://..."
                />
                <button type="button" className="place-photo-remove-button" onClick={() => onRemoveImage(index)}>
                  Kaldir
                </button>
              </div>
              {imageUrl.trim() ? (
                <img src={imageUrl} alt="Onizleme" className="place-photo-preview" />
              ) : (
                <div className="place-photo-placeholder">Onizleme yok</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="place-editor-actions">{actions}</div>
    </>
  )
}
