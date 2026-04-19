# placesclaudeadd — Placeholder Mekan Batch Paketi

Kaş Guide'a **hızlıca placeholder mekan eklemek** için üretilmiş SQL + prompt paketi.
Amaç: İsim bazında mekanları toplu yayına alıp (`status='published'`), içerikleri
("kısa açıklama", "uzun açıklama") sonradan doldurmak.

---

## Dosyalar

| Dosya | Amaç |
|-------|------|
| `placeholder-single.sql`       | Tek bir mekan için minimum INSERT (NOT EXISTS idempotent guard). |
| `placeholder-batch.sql`        | N mekan için CTE tabanlı batch INSERT template. |
| `placeholder-batch-prompt.md`  | ChatGPT / Claude / Gemini gibi LLM'lere verilecek deep-research prompt'u. |
| `README.md`                    | Bu dosya — akış, yönetim, rollback. |

**Şema uyumu:** Bu dosyalar live DB'de uygulanmış migration'lara (12/12) göre yazıldı; `category_ids text[]`, `kasguide_badges text[]` kolonları dahil edilir. `published_at` kolonu mevcut şemada yok → kullanılmaz, sıralama `updated_at DESC` üzerinden yapılır.

---

## Hızlı Başlangıç

### 1. Tek mekan (test amaçlı)

```bash
# Supabase Dashboard → SQL Editor
# placeholder-single.sql içeriğini yapıştır → slug/name/category düzenle → Run
```

### 2. Batch (5–50 mekan)

```
1. placeholder-batch-prompt.md → Prompt Şablonu'nu kopyala
2. ChatGPT/Claude'a yapıştır, {KATEGORI} ve {N} doldur
3. Dönen VALUES satırlarını kopyala
4. placeholder-batch.sql → input CTE'sindeki örnekleri sil, LLM çıktısını yapıştır
5. Supabase SQL Editor → Run
6. Alttaki SELECT bloku ile doğrula
```

---

## Veri Modeli Notları

Tablo: `public.places` (UUID PK, Supabase)

**Minimum zorunlu alanlar:** `name`, `category_primary`, `status`

**Bu batch tarafından doldurulan alanlar:**

| Alan | Değer |
|------|-------|
| `slug` | Batch input (benzersiz) |
| `name` | Batch input |
| `headline` | = `name` |
| `short_description` | `'Detaylı bilgiler yakında eklenecektir.'` |
| `long_description` | `'{name} için kapsamlı rehber içeriği yakında eklenecektir. …'` |
| `category_primary` | Batch input (whitelist kontrolü var) |
| `category_ids` | `ARRAY[category_primary]` |
| `kasguide_badge` | Batch input (`recommend` / `must-see` / `hidden-gem` / `local-favorite`) |
| `kasguide_badges` | `ARRAY[badge]` |
| `status` | `'published'` — **anında yayın** |
| `verification_status` | `'verified'` |
| `images` | `[]` — sonradan doldurulur |
| `raw_snapshot` | `{ source: 'manual_placeholder', batch_added_at, note }` — izleme tag'i |
| `created_at`, `updated_at` | `now()` |

**Kategori whitelist** (`src/lib/categories.ts` ile eşleşir):

```
bar, meyhane, restoran, cafe, kahvalti, oteller,
tarih, doga, plaj, carsi, gezi,
dalis, aktivite, etkinlik, patililer
```

Editorial kategoriler (`yazilar, roportaj, fotograf, oss, kas-local, acil-durum`)
placeholder mekan için **uygun değil** — whitelist dışı bırakıldı.

---

## Yönetim Sorguları

### Tüm placeholder kayıtlarını listele

```sql
SELECT slug, name, category_primary, kasguide_badge, updated_at
FROM public.places
WHERE raw_snapshot->>'source' = 'manual_placeholder'
ORDER BY updated_at DESC;
```

### Kategori bazında sayım

```sql
SELECT category_primary, count(*)
FROM public.places
WHERE raw_snapshot->>'source' = 'manual_placeholder'
GROUP BY category_primary
ORDER BY count(*) DESC;
```

### Hala içerik bekleyenler (doldurma listesi)

```sql
SELECT slug, name, category_primary
FROM public.places
WHERE raw_snapshot->>'source' = 'manual_placeholder'
  AND long_description LIKE '%yakında eklenecektir%'
ORDER BY created_at ASC;
```

### Bir kaydın içeriğini doldurma

```sql
UPDATE public.places
SET short_description = 'Gerçek kısa açıklama.',
    long_description  = 'Gerçek uzun editoryal açıklama (300+ kelime hedefi).',
    images            = '[{"url":"https://…","is_cover":true,"sort_order":0}]'::jsonb,
    updated_at        = now()
WHERE slug = 'ornek-slug';
```

> İçerik doldurulduğunda `raw_snapshot.source` tag'i `manual_placeholder` olarak
> kalabilir (geçmiş izlenebilir) — istersen şu güncelleme ile temizle:
> ```sql
> UPDATE public.places
> SET raw_snapshot = raw_snapshot - 'source'
> WHERE slug = 'ornek-slug';
> ```

---

## Rollback

### Belirli bir placeholder'ı yayından kaldır (silmeden)

```sql
UPDATE public.places
SET status = 'archived', updated_at = now()
WHERE slug = 'ornek-slug'
  AND raw_snapshot->>'source' = 'manual_placeholder';
```

### Tüm placeholder'ları yayından kaldır

```sql
UPDATE public.places
SET status = 'archived', updated_at = now()
WHERE raw_snapshot->>'source' = 'manual_placeholder';
```

### Tüm placeholder'ları kalıcı sil (DİKKAT)

```sql
DELETE FROM public.places
WHERE raw_snapshot->>'source' = 'manual_placeholder';
```

---

## Güvenlik / Sınırlar

| Durum | Davranış |
|-------|----------|
| Aynı slug tekrar eklenirse | `WHERE NOT EXISTS` guard → satır atlanır, hata yok. |
| Geçersiz kategori ID | `WHERE i.category_primary IN (...)` → satır atlanır, CHECK constraint patlamaz. |
| Geçersiz badge | `WHERE i.badge IN (...)` → satır atlanır. |
| Google Places ingestion ile çakışma | Placeholder'da `primary_source_name/id` NULL — unique index tetiklenmez. |

## Cache Notu

- `/mekan/[slug]` sayfası `export const revalidate = 3600` (1 saat).
- Ana sayfadaki liste (`listPublishedPlaces`) anlık query → **hemen görünür**.
- Detay sayfasının cache'ini kırmak için: site redeploy veya 1 saat bekle.

## SEO / Thin-Content Uyarısı

`bigconvert.md` A5.4 uygulandığında placeholder kayıtlar otomatik `<meta robots="noindex, follow">` alır (long_description < 60 kelime koşulu placeholder'ı yakalar). Yani:

- ✅ Site listesinde görünür, kategoride sayılır, internal link alır.
- ❌ Google tarafından indexlenmez → thin-content cezası riski yok.
- İçerik doldurulunca otomatik indexlenebilir hale gelir (eşik geçildiğinde).

---

## İlgili Dosyalar (referans)

- Kategori kaynağı: `src/lib/categories.ts`
- Read path: `src/lib/public-place-store.ts`
- Admin write path (karşılaştırma): `src/lib/place-persistence.ts`
- Detay sayfa: `src/app/mekan/[slug]/page.tsx`
- Schema migration'ları: `supabase/migrations/20260404123000_unify_places_single_table.sql`,
  `supabase/migrations/20260406113000_add_multi_category_and_badges_to_places.sql`
- Ana SEO planı: `bigconvert.md`

---

*Son güncelleme: 2026-04-19*
