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
  lat: string
  lng: string
}

const INITIAL_FORM: FormData = {
  name: '',
  categoryIds: [],
  address: '',
  phone: '',
  website: '',
  shortDescription: '',
  lat: '',
  lng: '',
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
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
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
      <section className="page-card page-card-wide">
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Teşekkürler!</h2>
          <p style={{ color: 'var(--color-muted, #888)', marginBottom: '1.5rem' }}>
            Mekan öneriniz alındı. Ekibimiz en kısa sürede inceleyecek.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_FORM)
              setStatus('idle')
              setErrorMsg('')
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border, #333)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Başka Mekan Öner
          </button>
        </div>
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="page-card page-card-wide">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
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
            style={inputStyle}
          />
        </div>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Kategori * (en fazla 3)</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {CATEGORY_GROUPS.filter((g) => g.tone !== 'editorial').map((group) => (
              <div key={group.title} style={{ width: '100%', marginBottom: '0.25rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted, #888)', marginBottom: '0.25rem' }}>
                  {group.title}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {group.ids.filter((id) => SUBMITTABLE_CATEGORY_IDS.includes(id)).map((id) => {
                    const cat = CATEGORIES.find((c) => c.id === id)
                    if (!cat) return null
                    const selected = form.categoryIds.includes(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleCategory(id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-md, 8px)',
                          border: `1px solid ${selected ? 'var(--color-accent, #f59e0b)' : 'var(--color-border, #333)'}`,
                          background: selected ? 'var(--color-accent, #f59e0b)' : 'transparent',
                          color: selected ? '#000' : 'inherit',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.15s',
                        }}
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
            <p style={{ fontSize: '0.8rem', color: 'var(--color-error, #ef4444)', marginTop: '0.25rem' }}>
              En az bir kategori seçin
            </p>
          )}
        </fieldset>

        <div>
          <label htmlFor="address" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
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
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="phone" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
              Telefon
            </label>
            <input
              id="phone"
              type="tel"
              maxLength={50}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="ör: +90 242 836 1234"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="website" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
              Website
            </label>
            <input
              id="website"
              type="url"
              maxLength={500}
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="ör: https://ornek.com"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label htmlFor="shortDescription" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
            Kısa Açıklama
          </label>
          <textarea
            id="shortDescription"
            maxLength={500}
            rows={3}
            value={form.shortDescription}
            onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
            placeholder="Mekan hakkında kısa bilgi..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="lat" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
              Enlem (opsiyonel)
            </label>
            <input
              id="lat"
              type="number"
              step="any"
              min={-90}
              max={90}
              value={form.lat}
              onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))}
              placeholder="ör: 36.2012"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="lng" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
              Boylam (opsiyonel)
            </label>
            <input
              id="lng"
              type="number"
              step="any"
              min={-180}
              max={180}
              value={form.lng}
              onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))}
              placeholder="ör: 29.6386"
              style={inputStyle}
            />
          </div>
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--color-error, #ef4444)', fontSize: '0.9rem', margin: 0 }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting' || form.categoryIds.length === 0}
          style={{
            padding: '0.85rem 1.5rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: 'none',
            background: 'var(--color-accent, #f59e0b)',
            color: '#000',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: status === 'submitting' ? 'wait' : 'pointer',
            opacity: status === 'submitting' ? 0.7 : 1,
          }}
        >
          {status === 'submitting' ? 'Gönderiliyor...' : 'Mekan Öner'}
        </button>
      </div>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: 'var(--radius-md, 8px)',
  border: '1px solid var(--color-border, #333)',
  background: 'transparent',
  color: 'inherit',
  fontSize: '0.95rem',
}
