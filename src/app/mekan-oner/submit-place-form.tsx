'use client'

import { useState } from 'react'

import { CATEGORIES, CATEGORY_GROUPS } from '@/lib/categories'

const SUBMITTABLE_CATEGORY_IDS = CATEGORIES.filter(
  (c) => c.group !== null && c.group !== 'editorial',
).map((c) => c.id)

type FormData = {
  name: string
  categoryIds: string[]
  address: string
  phone: string
  website: string
  shortDescription: string
}

const INITIAL_FORM: FormData = {
  name: '',
  categoryIds: [],
  address: '',
  phone: '',
  website: '',
  shortDescription: '',
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function SubmitPlaceForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const toggleCategory = (id: string) => {
    setForm((prev) => {
      const next = prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : prev.categoryIds.length >= 3
          ? prev.categoryIds
          : [...prev.categoryIds, id]
      return { ...prev, categoryIds: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setStatus('submitting')

    const payload = {
      name: form.name,
      categoryIds: form.categoryIds,
      address: form.address,
      phone: form.phone || undefined,
      website: form.website || undefined,
      shortDescription: form.shortDescription || undefined,
    }

    try {
      const res = await fetch('/api/places/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Bir hata oluştu.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMsg('Bağlantı hatası. Lütfen tekrar deneyin.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section className="submit-place-card submit-place-success-card">
        <div className="submit-place-success-content">
          <div className="submit-place-success-icon" aria-hidden="true">✅</div>
          <h2 className="submit-place-success-title">Teşekkürler!</h2>
          <p className="submit-place-success-copy">
            Mekan öneriniz alındı. Ekibimiz en kısa sürede inceleyecek.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_FORM)
              setStatus('idle')
              setErrorMsg('')
            }}
            className="submit-place-secondary-button"
          >
            Başka Mekan Öner
          </button>
        </div>
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="submit-place-card">
      <div className="submit-place-stack">
        <div className="submit-place-field">
          <label htmlFor="name" className="submit-place-label">
            Mekan Adı *
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            maxLength={200}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="ör: Güzel Kafe"
            className="submit-place-input"
          />
        </div>

        <fieldset className="submit-place-fieldset">
          <legend className="submit-place-legend">Kategori * (en fazla 3)</legend>
          <div className="submit-place-groups">
            {CATEGORY_GROUPS.filter((g) => g.tone !== 'editorial').map((group) => (
              <div key={group.title} className="submit-place-group">
                <p className="submit-place-group-title">{group.title}</p>
                <div className="submit-place-chip-list">
                  {group.ids.filter((id) => SUBMITTABLE_CATEGORY_IDS.includes(id)).map((id) => {
                    const cat = CATEGORIES.find((c) => c.id === id)
                    if (!cat) return null
                    const selected = form.categoryIds.includes(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleCategory(id)}
                        className={`submit-place-chip${selected ? ' is-selected' : ''}`}
                        aria-pressed={selected}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {form.categoryIds.length === 0 && (
            <p className="submit-place-helper-error">
              En az bir kategori seçin
            </p>
          )}
        </fieldset>

        <div className="submit-place-field">
          <label htmlFor="address" className="submit-place-label">
            Adres *
          </label>
          <input
            id="address"
            type="text"
            required
            minLength={5}
            maxLength={500}
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="ör: Cumhuriyet Mah. Çarşı Cd. No:12, Kaş"
            className="submit-place-input"
          />
        </div>

        <div className="submit-place-grid">
          <div className="submit-place-field">
            <label htmlFor="phone" className="submit-place-label">
              Telefon
            </label>
            <input
              id="phone"
              type="tel"
              maxLength={50}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="ör: +90 242 836 1234"
              className="submit-place-input"
            />
          </div>
          <div className="submit-place-field">
            <label htmlFor="website" className="submit-place-label">
              Website
            </label>
            <input
              id="website"
              type="url"
              maxLength={500}
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="ör: https://ornek.com"
              className="submit-place-input"
            />
          </div>
        </div>

        <div className="submit-place-field">
          <label htmlFor="shortDescription" className="submit-place-label">
            Kısa Açıklama
          </label>
          <textarea
            id="shortDescription"
            maxLength={500}
            rows={3}
            value={form.shortDescription}
            onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
            placeholder="Mekan hakkında kısa bilgi..."
            className="submit-place-input submit-place-textarea"
          />
        </div>

        {errorMsg && (
          <p className="submit-place-error-banner">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting' || form.categoryIds.length === 0}
          className="submit-place-submit"
        >
          {status === 'submitting' ? 'Gönderiliyor...' : 'Mekan Öner'}
        </button>
      </div>
    </form>
  )
}
