# Kaş Guide — Agent Onboarding (Teknik Brief)

> **Hedef**: Yeni Claude Code agent'larının projeyi sıfırdan anlayıp üretken çalışabilmesi için hazırlanmış kompakt teknik referans.
> **Son Güncelleme**: 2026-04-24
> **İlgili Dokümanlar**: [`ARCHITECTURE.md`](./ARCHITECTURE.md) (derin mimari), [`TECH_STACK.md`](./TECH_STACK.md) (stack özeti), [`CLAUDE.md`](./CLAUDE.md) (proje kuralları), [`AGENTS.md`](./AGENTS.md) (tuzaklar).

---

## 1. Hızlı Bakış (TL;DR)

- **Ne**: Kaş/Antalya için küratörlü şehir rehberi. Public portal + admin review paneli + veri pipeline'ı.
- **Neden değil**: Kullanıcı üretimli içerik platformu değil, gerçek zamanlı değil, multi-tenant değil.
- **Stack**: Next.js 15 (App Router) + React 19 + TypeScript 5.8 + Tailwind 4 + Supabase (Postgres) + Zod 4.
- **Node**: `>=22.13.0 <23` (zorunlu).
- **Dağıtım**: Coolify / Vercel.
- **Dil**: Kullanıcı arayüzü ve içerik **Türkçe**. Rotalar Türkçe (`/mekan/[slug]`, `/haberler`, `/duyurular`, `/iletisim`, `/biz-kimiz`).

---

## 2. Dizin Haritası

```
src/
├── app/                          # Next.js App Router (pages + API)
│   ├── api/
│   │   ├── places/              # Public: mekan listeleme + kullanıcı submit
│   │   ├── hero-slides/         # Public: anasayfa carousel
│   │   ├── news/, announcements/# Public: içerik feed
│   │   ├── health/, place-counts/, hero-insights/
│   │   └── admin/               # Protected: review, places, news, announcements, hero-slides, session
│   ├── mekan/[slug]/            # Public: mekan detay (ISR 3600s)
│   ├── haberler/, duyurular/    # Public: içerik sayfaları
│   ├── admin/                   # Admin SPA: review, places, sweeps, hero-slides, updates
│   └── page.tsx                 # Anasayfa (ISR 3600s)
├── components/                  # Paylaşılan UI (Header, Footer, button/input/textarea/select)
├── features/                    # Feature-bazlı UI (home/, faq/, planner/, results/)
├── lib/                         # SERVICE LAYER — tüm DB mantığı burada
└── types/                       # Global tip tanımları (review.ts, updates.ts)

supabase/migrations/             # Chronological SQL migrations (YYYYMMDDHHmmSS prefix)
scripts/                         # Node TS scripts — ingestion, seed, backfill, maintenance
db/                              # Ek veritabanı dosyaları
public/                          # Statik varlıklar
old/                             # Eski projenin referans arşivi (DOKUNMA)
```

**Kritik kural**: API rotaları Supabase'e **asla** doğrudan çağrı yapmaz. Her DB etkileşimi `src/lib/*-store.ts` içindeki fonksiyonlardan geçer.

---

## 3. Veritabanı Şeması (Özet)

### Ana Tablolar
| Tablo | Amaç |
|-------|------|
| `places` | Kanonik mekan kayıtları (slug, name, kategori, geo, status) |
| `place_content` | Editoryal içerik (headline, short/long description) |
| `place_images` | Görsel galerisi (url, is_cover, sort_order) |
| `place_sources` | İzlenebilirlik — hangi raw kaynağından geldi |
| `raw_places` | İşlenmemiş import verisi (name_raw, raw_payload JSONB, processing_status) |
| `review_queue` | Çakışma/duplicate çözüm kuyruğu |
| `grid_sweeps`, `grid_sweep_cells` | Mekansal import oturumları |
| `hero_slides` | Anasayfa carousel slaytları |
| `news`, `announcements` | Haberler & duyurular CMS'i |

### Status Enum'ları
```
raw_places.processing_status : pending | normalized | review | rejected | error
places.status                : draft | review | published | archived | pending | admin | rejected | merged | error
places.verification_status   : pending | reviewed | verified | rejected
review_queue.status          : pending | in_review | approved | merged | rejected
grid_sweeps.status           : running | completed | partial | failed
content (news/announcements) : draft | published | archived
```

### Migration'lar
- Kronolojik prefix formatı: `YYYYMMDDHHmmSS_name.sql`
- Önemli milestones: `20260404123000_unify_places_single_table`, `20260406113000_add_multi_category_and_badges_to_places`, `20260412124000_add_user_submission_intake_channel`.
- **Asla** eski migration'ları düzenleme; her zaman yeni bir dosya ekle.

---

## 4. Service Layer (`src/lib/`) — En Önemli Bölüm

| Dosya | Sorumluluk |
|-------|-----------|
| `supabase.ts` | Public (anon) Supabase istemcisi |
| `supabase-admin.ts` | Service role istemcisi (yalnız sunucu) |
| `admin-auth.ts` | `isAdminAuthorized()` — timing-safe şifre kontrolü |
| `admin-password-client.ts` | Tarayıcı taraflı sessionStorage yardımcıları |
| `api-helpers.ts` | Tutarlı JSON response envelope yardımcıları |
| `api-schemas.ts` | **Tüm API Zod şemaları burada** |
| `public-place-store.ts` | Yayınlanmış mekanlar için salt-okunur sorgular |
| `place-review-store.ts` | Admin dashboard verisi, review kuyruk aksiyonları |
| `raw-place-store.ts` | Raw place CRUD, `persistPlaceFromRaw()`, draft hydration |
| `place-admin-store.ts` | Var olan yayınlanmış mekan düzenleme |
| `place-persistence.ts` | Paylaşılan upsert yardımcıları (places/content/images/sources) |
| `place-draft-builder.ts` | `buildDraftFromRaw()` — raw veriden `PlaceEditorDraft` üretir |
| `place-review-utils.ts` | `normalizeText/Phone/Website`, `slugifyText` (TR karakterleri) |
| `place-taxonomy.ts` | Kategori seçenekleri + Google types mapping (21 kategori) |
| `categories.ts` | **Kategorilerin tek kaynağı** — taxonomy buradan import eder |
| `hero-slide-store.ts`, `hero-slide-data.ts` | Hero carousel verisi |
| `updates-store.ts` | News/announcements CRUD |
| `planner-data.ts`, `faq-data.ts` | Statik içerik |
| `public-place-types.ts`, `place-schema.ts` | Paylaşılan tipler & JSON-LD yardımcıları |
| `legacy-text.ts` | Eski format metinleri dönüştürme |

### Store Pattern Altın Kuralı
1. API route → body'yi Zod ile doğrula → store fonksiyonunu çağır → sonucu envelope'layıp döndür.
2. Store fonksiyonları ilgili Supabase istemcisini alır (anon **veya** admin) — istemciyi içeri enjekte etmek test edilebilirliği korur.
3. Business logic **yalnız** store'larda. API route'ları ince olacak.

---

## 5. API Layer

### Public Rotalar (anon key, RLS aktif)
```
GET  /api/places                # Kategoriye göre yayınlanmış mekanlar
POST /api/places/submit         # Kullanıcı mekan önerisi (UserPlaceSubmissionSchema)
GET  /api/hero-slides           # Anasayfa carousel
GET  /api/hero-insights         # Hero metadata
GET  /api/place-counts          # Kategori bazlı sayaçlar
GET  /api/news                  # Yayınlanmış haberler
GET  /api/announcements         # Aktif duyurular
GET  /api/health                # Liveness probe
```

### Admin Rotaları (`X-Admin-Password` header zorunlu)
```
POST /api/admin/session         # Şifre doğrulama endpoint'i
*    /api/admin/review          # Review kuyruk aksiyonları (ReviewActionBodySchema)
*    /api/admin/places          # Raw + mevcut place CRUD (RawPlaceSaveBodySchema, ExistingPlaceSaveBodySchema)
*    /api/admin/hero-slides     # Hero CMS
*    /api/admin/news            # Haber CRUD
*    /api/admin/news/[id]       # Haber detay
*    /api/admin/announcements   # Duyuru CRUD
*    /api/admin/announcements/[id]
```

### Standart Admin Route Şablonu
```typescript
const authed = await isAdminAuthorized(request)
if (!authed) return unauthorized()

const body = SomeSchema.safeParse(await request.json())
if (!body.success) return badRequest(body.error)

const result = await someStoreFunction(adminClient, body.data)
return ok(result)
```

### Response Envelope
```typescript
{ ok: boolean; data?: T; error?: string }
```
`src/lib/api-helpers.ts` bu envelope'u üreten yardımcıları içerir. **Her yeni rotada kullan.**

---

## 6. Veri Pipeline'ı (End-to-End)

```
1. INGEST   scripts/import-google-grid.ts → raw_places (pending)
            scripts/import-osm.ts         → raw_places (pending, source=osm)
            POST /api/places/submit       → raw_places (pending, source=user)

2. NORMALIZE  Admin dashboard /admin/review
              buildDraftFromRaw() → PlaceEditorDraft (editörün düzenlediği)
              Kategori önerisi:   suggestCategoryFromRaw()
              Telefon/website:    normalizePhone(), normalizeWebsite()

3. DEDUPE     review_queue (çoğunlukla manuel — otomasyon henüz yok)

4. PUBLISH    persistPlaceFromRaw(adminClient, rawPlaceId, draft)
              → places + place_content + place_images + place_sources
              → raw_places.processing_status = 'normalized'

5. SERVE      /api/places?category=... → public-place-store.listPublishedPlacesByCategory()
              ISR (3600s TTL) anasayfa + mekan detay sayfalarında
```

### Önemli Script'ler (her biri `npm run <adı>`)
| Script | Amaç |
|--------|------|
| `normalize:places` | Eksik alanları toplu normalize et |
| `dedupe:places` | Duplicate adayları işaretle |
| `backfill:legacy-review` | Eski veriyi review hattına taşı |
| `publish:reviewed` | Onaylanmış taslakları toplu yayınla |
| `reset:ingestion` | Ingestion durumunu sıfırla |
| `test:google-places` | Google Places API sağlık kontrolü |
| `seed:sample-bar` | Test verisi ekle |
| `sync:next-chunks` | Next.js server chunk senkronizasyonu (postbuild/prestart) |

**Script çalıştırma (TEK DOĞRU YÖNTEM)**:
```bash
node --no-warnings=MODULE_TYPELESS_PACKAGE_JSON --env-file=.env.local --experimental-strip-types scripts/<isim>.ts
```
`ts-node` veya `tsx` **kullanma**. `--env-file=.env.local` zorunludur.

---

## 7. Kimlik Doğrulama

- **Admin modeli**: Tarayıcı `sessionStorage`'dan şifreyi okur → her istekte `X-Admin-Password` header'ına koyar → sunucu `admin-auth.ts` içinde `timingSafeEqual` ile `ADMIN_PASSWORD` veya `ADMIN_API_KEY` env değişkenleriyle karşılaştırır.
- **Bilinen zayıflıklar**: Plaintext header, XSS ile erişilebilir storage, oturum süresi yok, rate limiting yok. Bunları değiştirirken `ARCHITECTURE.md` §5 ve §8'deki iyileştirme planını takip et.
- **Supabase Auth KULLANILMIYOR**. Anon key ile RLS, service role key yalnız sunucuda.

---

## 8. Frontend Mimarisi

- **App Router + Server Components varsayılan**. Etkileşim gereken yerlerde `'use client'` direktifi.
- **ISR**: Anasayfa ve `/mekan/[slug]` `revalidate = 3600`. API rotaları `force-dynamic`.
- **Stil**: Tailwind 4 (`@tailwindcss/postcss`) + `globals.css`. Glassmorphism, fluid typography, CSS clamp yoğun kullanılıyor.
- **Görseller**: Çoğunlukla ham `<img>` etiketi, manuel `fetchPriority`/`loading` ile. `next/image` bazı kritik yerlerde. Görsel kaynakları şimdilik **harici URL** (Supabase Storage henüz yok).
- **State**: Admin dashboard için iki ana custom hook: `useAdminAuth` (şifre yaşam döngüsü) ve `useReviewDashboard` (sunucudan snapshot yükle, aksiyon gönder, yeniden yükle).

---

## 9. Kategoriler (Tek Kaynak)

`src/lib/categories.ts` 21 kategoriyi tanımlar. `place-taxonomy.ts` ondan import eder. **İkiyi de kendi başına düzenleme**. Kategori eklerken:
1. `categories.ts`'e ekle (id, label, icon, googleTypes).
2. Şemalar otomatik yayılır.
3. Gerekirse admin form'larında label'ı kontrol et.

Temel kategoriler: `restaurant`, `cafe`, `bar`, `beach`, `hotel`, `pension`, `activity`, `shopping`, `culture`, `nature`, `viewpoint`, `dive`, `boat`, `petfriendly`, `breakfast`, `icecream` + son eklenenler.

---

## 10. Doğrulama (Zod)

- **Tüm API sınırları Zod ile doğrulanır**. Şemalar `src/lib/api-schemas.ts` içinde.
- Yeni bir rota eklerken:
  1. Şemayı `api-schemas.ts`'e ekle ve export et.
  2. Request parsing için `safeParse` kullan, hatada 400 döndür.
  3. `z.infer<typeof Schema>` ile TypeScript tipini türet, tekrar yazma.

---

## 11. Güvenlik Checklist'i

Commit etmeden önce:
- [ ] Kod içinde hardcoded secret yok (env var kullan).
- [ ] Admin endpoint'inde ilk iş `isAdminAuthorized(request)`.
- [ ] Request body Zod ile doğrulandı.
- [ ] Kullanıcı girdileri store'a ulaşmadan önce normalize edildi (`normalizeText`/`normalizePhone`/`normalizeWebsite`).
- [ ] Response'ta hassas veri veya stack trace sızıntısı yok.
- [ ] Kullanıcı verisi loglara düşürülmüyor (Art. 9 DSGVO).

---

## 12. Performans Beklentileri

- Public API rotaları şu an `force-dynamic` — geniş traffic öncesi `Cache-Control: s-maxage=60, stale-while-revalidate=300` eklenmesi planlı.
- `/mekan/[slug]` ISR. `persistPlaceFromRaw()` sonrası `revalidatePath()` henüz çağrılmıyor; yayın sonrası tazeleme ~1 saat gecikebilir.
- Pagination henüz kursor-bazlı değil; `/api/places` default `limit=12`.

---

## 13. Test Durumu

- **Şu an sıfır test** (`__tests__/` klasörü yok, Vitest/Playwright kurulu değil).
- Yeni test eklerken öncelik: `slugifyText`, `normalizePhone`, `isAdminAuthorized`, `persistPlaceFromRaw`, review queue state transition'ları.
- Framework kararı: Vitest (unit/integration) + Playwright (E2E) — proje standardı ile uyumlu.

---

## 14. Ortam Değişkenleri

```env
# Public (tarayıcıya iletilir)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_API_KEY=

# Ingestion script'leri için
GOOGLE_PLACES_API_KEY=
DATABASE_URL=
POSTGRES_URL=

# E-posta (iletişim formu)
SMTP_HOST=smtp.zoho.eu
SMTP_USER=
SMTP_PASS=
```

`.env.local` dosyası yerel geliştirme içindir; commit etme.

---

## 15. Agent için Yapılacaklar / Yapılmayacaklar

### YAP
- Küçük diff'ler çıkar, dosya başına odaklanmış sorumluluk.
- Mevcut store fonksiyonlarını kullan, yeni üretmeden önce `lib/`'de ara.
- TR karakter normalizasyonunu `slugifyText`'e bırak (ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c).
- API yanıtlarında `api-helpers.ts` envelope'unu koru.
- Migration eklerken kronolojik prefix kullan.

### YAPMA
- Route handler içinde doğrudan Supabase çağrısı yapma — daima `lib/` üstünden.
- `old/` klasörünü değiştirme (salt-okunur referans).
- `ts-node` veya `tsx` ile script çalıştırma — yalnız Node stripping.
- `next/image` kullanırken projedeki mevcut manuel optimizasyon kararlarını üzerine yazma — önce yapılandırmayı kontrol et.
- `any` kullanma; `unknown` + daraltma ya da generic kullan.
- Yeni `CATEGORIES` listesi yaratma — `categories.ts` tek kaynak.
- Şifre/API key loga yazma.

---

## 16. İlk Gün Okuma Listesi (Sırayla)

1. `CLAUDE.md` — proje kuralları ve güvenlik talimatları.
2. `AGENTS.md` — bilinen tuzaklar.
3. Bu dosya (`AGENT_ONBOARDING.md`).
4. `ARCHITECTURE.md` — derin mimari, risk haritası, iyileştirme TODO'ları.
5. `src/lib/raw-place-store.ts` → `persistPlaceFromRaw()` — pipeline'ın kalbi.
6. `src/app/admin/review/page.tsx` + `useReviewDashboard.ts` — admin UX'i.
7. `src/lib/api-schemas.ts` — API sınırları.

---

*Bu dosya proje geliştikçe güncellenmelidir. Ciddi değişiklikler (yeni store, yeni route grubu, kategori değişikliği, auth değişimi) eklenmelidir.*
