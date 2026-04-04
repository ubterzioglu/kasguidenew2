'use client'

import type { PlaceEditorDraft } from '@/types/review'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

type PlaceEditorFormProps = {
  itemId: string
  draft: PlaceEditorDraft
  categoryOptions: { value: string; label: string }[]
  photoHint: string
  onUpdateField: (field: keyof PlaceEditorDraft, value: string) => void
  onUpdateImage: (index: number, value: string) => void
  onAddImage: () => void
  onRemoveImage: (index: number) => void
  actions: React.ReactNode
}

export function PlaceEditorForm({
  itemId,
  draft,
  categoryOptions,
  photoHint,
  onUpdateField,
  onUpdateImage,
  onAddImage,
  onRemoveImage,
  actions,
}: PlaceEditorFormProps) {
  return (
    <>
      <div className="place-editor-grid">
        <Input
          label="Mekan adi"
          value={draft.name}
          onChange={(event) => onUpdateField('name', event.target.value)}
        />

        <Input
          label="Mekan basligi"
          value={draft.headline}
          onChange={(event) => onUpdateField('headline', event.target.value)}
        />

        <Textarea
          label="Kisa aciklama"
          isWide
          rows={3}
          value={draft.shortDescription}
          onChange={(event) => onUpdateField('shortDescription', event.target.value)}
        />

        <Textarea
          label="Detayli aciklama"
          isWide
          rows={5}
          value={draft.longDescription}
          onChange={(event) => onUpdateField('longDescription', event.target.value)}
        />

        <Select
          label="Kategori"
          value={draft.categoryPrimary}
          onChange={(event) => onUpdateField('categoryPrimary', event.target.value)}
          options={categoryOptions}
        />

        <Input
          label="Kasguide badge"
          value={draft.kasguideBadge}
          onChange={(event) => onUpdateField('kasguideBadge', event.target.value)}
          placeholder="Ornek: Kas Guide Onerir"
        />

        <Input
          label="Website"
          value={draft.website}
          onChange={(event) => onUpdateField('website', event.target.value)}
          placeholder="https://..."
        />

        <Input
          label="Adres"
          isWide
          value={draft.address}
          onChange={(event) => onUpdateField('address', event.target.value)}
        />

        <Input
          label="Telefon"
          value={draft.phone}
          onChange={(event) => onUpdateField('phone', event.target.value)}
        />
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
              <Input
                label={`Foto URL #${index + 1}`}
                isWide
                value={imageUrl}
                onChange={(event) => onUpdateImage(index, event.target.value)}
                placeholder="https://..."
              />
              <Button type="button" variant="ghost" onClick={() => onRemoveImage(index)}>
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

      <div className="place-editor-actions">{actions}</div>
    </>
  )
}
