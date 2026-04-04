import { useState, useCallback } from 'react'

import type { PlaceEditorDraft } from './types'

/**
 * Generic draft editor state for a keyed collection of PlaceEditorDraft objects.
 * Used twice in useReviewDashboard: once for raw places, once for existing places.
 */
export function useDraftEditor() {
  const [drafts, setDrafts] = useState<Record<string, PlaceEditorDraft>>({})

  const hydrate = useCallback((items: Array<{ id: string; draft: PlaceEditorDraft }>) => {
    setDrafts(() => {
      const next: Record<string, PlaceEditorDraft> = {}
      for (const item of items) {
        next[item.id] = {
          ...item.draft,
          imageUrls: item.draft.imageUrls.length > 0 ? [...item.draft.imageUrls] : [''],
        }
      }
      return next
    })
  }, [])

  const updateField = (id: string, field: keyof PlaceEditorDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: field === 'imageUrls' ? current[id]?.imageUrls : value,
      },
    }))
  }

  const updateImage = (id: string, index: number, value: string) => {
    setDrafts((current) => {
      const nextImages = [...(current[id]?.imageUrls ?? [''])]
      nextImages[index] = value
      return { ...current, [id]: { ...current[id], imageUrls: nextImages } }
    })
  }

  const addImage = (id: string) => {
    setDrafts((current) => {
      const images = [...(current[id]?.imageUrls ?? [''])]
      if (images.length >= 5) return current
      images.push('')
      return { ...current, [id]: { ...current[id], imageUrls: images } }
    })
  }

  const removeImage = (id: string, index: number) => {
    setDrafts((current) => {
      const images = [...(current[id]?.imageUrls ?? [''])]
      if (images.length <= 1) {
        images[0] = ''
      } else {
        images.splice(index, 1)
      }
      return { ...current, [id]: { ...current[id], imageUrls: images } }
    })
  }

  return { drafts, hydrate, updateField, updateImage, addImage, removeImage }
}
