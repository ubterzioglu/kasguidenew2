# Kaş Guide New - Claude Code Proje Rehberi

## Proje Özeti

Kaş Guide, Kaş/Antalya için kapsamlı bir şehir rehberi uygulamasıdır. Next.js 15, TypeScript, Tailwind CSS ve Supabase ile geliştirilmektedir.

## Teknoloji Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Coolify / Vercel

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Ana sayfa
│   └── globals.css         # Global stiller
├── components/             # React component'leri
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ItemCard.tsx
│   └── CategoryFilter.tsx
└── lib/                    # Utility fonksiyonları
    ├── supabase.ts         # Supabase client
    └── api.ts              # API fonksiyonları
```

## Database Şeması

Şema, `supabase/migrations/*.sql` altında sıralı, timestamp-prefix'li Supabase CLI migration dosyalarıyla yönetilir. Aşağıdaki tablolar güncel gerçek durumu yansıtır (bkz. migration geçmişi için `supabase/migrations/`).

### Places Tablosu (Unified — mekanlar)

Tüm mekan içeriği (restoran, otel, plaj, vb.) tek bir `places` tablosunda, `category_primary`/`category_ids` ile kategori ayrımı yapılarak tutulur.

Önemli kolonlar: `id`, `slug`, `name`, `headline`, `short_description`, `long_description`, `category_primary`, `category_ids[]`, `kasguide_badges[]`, `address`, `lat`/`lng`, `phone`, `website`, `images` (jsonb array), `status`, `verification_status`, `intake_channel`, `primary_source_name`, `raw_snapshot` (jsonb), `source_records` (jsonb array).

- **Status Workflow**: `pending → review → admin → published` (ayrıca `rejected`/`archived`/`merged`/`error`)
- **`intake_channel`** (text + CHECK constraint, enum değil): `'sweep' | 'manual' | 'import' | 'migrated' | 'user_submission' | 'scraper'` — mekanın nasıl sisteme girdiğini işaretler (`'scraper'`: otomatik hizmet arama scraper'ından gelen adaylar).
- **Slug Generation**: Türkçe karakter normalizasyonu (ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c)

### News / Announcements Tabloları (haberler ve duyurular)

Ayrı `news` ve `announcements` tabloları, `src/lib/updates-store.ts` üzerinden yönetilir. Ortak `status` (`draft|published|archived`) alanı var; `announcements` ayrıca `priority` (`urgent|normal|info`) ve `start_date`/`end_date` görünürlük penceresi taşır. `news` tablosunda scraper provenance için `source_url`/`source_name` (nullable) kolonları bulunur.

### Scraper Tabloları (admin panel — otomatik veri toplama)

- **`news_scraper_sources`**: haber scraper'ının taradığı RSS/Atom/GDELT kaynaklarının admin-yönetilen listesi (`feed_url`, `is_enabled`, `last_run_*`).
- **`place_scraper_jobs`** / **`place_scraper_candidates`**: hizmet arama (Tavily+Gemini tabanlı) scraper'ının iş kuyruğu ve incelemeye açık aday mekan kayıtları. Adaylar admin onayıyla `places` tablosuna `intake_channel: 'scraper'` olarak "yükseltilir" (promote).

### Önemli Kurallar

1. **SQL Template Tag**: Database sorguları için parameterized query kullan
2. **Unified Places Table**: Tüm mekan içeriği `places` tablosunda, kategori alanlarıyla ayrım yapılıyor
3. **Status Workflow**: `pending → review → admin → published`
4. **Slug Generation**: Türkçe karakter normalizasyonu (ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c)

## Kategoriler

| ID | İsim | İkon |
|----|------|------|
| restaurant | Restoran | 🍽️ |
| cafe | Kafe | ☕ |
| bar | Bar | 🍺 |
| beach | Plaj | 🏖️ |
| hotel | Otel | 🏨 |
| pension | Pansiyon | 🏠 |
| activity | Aktivite | 🎯 |
| shopping | Alışveriş | 🛍️ |
| culture | Kültür | 🏛️ |
| nature | Doğa | 🌿 |
| viewpoint | Manzara | 🌄 |
| dive | Dalış | 🤿 |
| boat | Tekne | ⛵ |
| petfriendly | Patili Dostu | 🐕 |
| breakfast | Kahvaltı | 🥐 |
| icecream | Dondurma | 🍦 |

## Development Komutları

```bash
npm run dev      # Development server başlat (localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint kontrolü
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Admin
ADMIN_API_KEY=...
ADMIN_PASSWORD=...

# External APIs
GOOGLE_PLACES_API_KEY=...

# Hizmet arama scraper (Service Finder pipeline — Tavily + Gemini)
TAVILY_API_KEY=...          # search+extract için gerekli
SERPAPI_API_KEY=...         # opsiyonel, fallback arama sağlayıcısı
GEMINI_API_KEY=...          # sınıflandırma için gerekli (Google Gemini API)

# Email
SMTP_HOST=smtp.zoho.eu
SMTP_USER=...
SMTP_PASS=...
```

Not: Haber scraper için ek env var gerekmez (kaynaklar public RSS/Atom feed'leridir, admin panelden `news_scraper_sources` tablosu üzerinden yönetilir).

## Eski Proje Referansı

Eski proje `old/` klasöründe bulunuyor. Referans için:
- `old/index.html` - Eski ana sayfa yapısı
- `old/script.js` - Eski JavaScript mantığı
- `old/api/` - Eski API endpoints
- `old/lib/db-items.js` - Eski database işlemleri

## Güvenlik Kuralları

1. **API Key**: Admin endpoint'leri için `X-API-Key` header'ı gerekli
2. **File Upload**: Sadece JPG/PNG/WEBP, max 2MB
3. **CSP Headers**: `vercel.json`'da tanımlı
4. **SSL**: Database bağlantısı SSL zorunlu

## Session Geçmişi

Detaylı geçmiş için [HISTORY.md](./HISTORY.md) dosyasına bakınız.

---

*Bu dosya proje boyunca güncellenecektir.*
