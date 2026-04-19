# bigconvert.md — kasguide.de SEO + GEO Uygulama Planı

> **Amaç:** kasguide.de için hem klasik SEO hem GEO (AI answer engine) uyumunu artıracak teknik ve içerik işlerini, mevcut Next.js 15 App Router projesine **birebir uygulanabilir** şekilde iki parçaya ayırmak.
>
> **Stack referansı (mevcut durum):**
> - `next@^15.2.4`, React 19, TypeScript 5, Tailwind 4 (App Router, `output: 'standalone'`)
> - `src/app/layout.tsx` — global `metadata` var, **ama `metadataBase` yok, canonical yok**
> - `src/app/page.tsx` — **H1 yok**, editorial metin yok, sadece `HeroCarousel` + `CategorySection` + promolar
> - `src/app/robots.ts` **yok**, `src/app/sitemap.ts` **yok**
> - `src/app/mekan/[slug]/page.tsx` — `generateMetadata` var, **canonical yok, JSON-LD yok**
> - Kategori ID’leri (`src/lib/categories.ts`): `bar, meyhane, restoran, cafe, kahvalti, oteller, tarih, doga, plaj, carsi, gezi, dalis, aktivite, etkinlik, yazilar, roportaj, fotograf, oss, kas-local, acil-durum, patililer`
> - Mevcut statik sayfalar: `/biz-kimiz`, `/iletisim`, `/faq`, `/mekan-oner`, `/planner`, `/local`, `/duyurular[/slug]`, `/haberler[/slug]`, `/result`
> - Detay route: `/mekan/[slug]` (revalidate 3600)
> - Admin: `/admin/*` (noindex olmalı)
>
> **Domain kararı:** Kanonik host `https://www.kasguide.de` (301 yönlendirme apex → www). OG/URL’lerde tek tip kullanılmalı; layout şu an `https://kasguide.de` kullanıyor, bu düzeltilecek.

---

## Bölüm A — Hemen Yapılabilecekler (Sprint 1, GLM 5.1 için implementasyon paketi)

> GLM 5.1 bu bölümü baştan sona aynı sırayla uygulamalı. Her iş için **dosya yolu, değişiklik özeti, kabul kriteri** verildi. Hiçbir adım admin/internal route’u indekse açmamalı.

### A0. Ön-kurallar (her adım için bağlayıcı)
1. **Tek kanonik host:** `https://www.kasguide.de`. Tüm mutlak URL’ler, OG, canonical, sitemap bu hostu kullanır.
2. **Dil:** `<html lang="tr">` kalır; gelecek EN sayfalar için `hreflang` Bölüm B’de ele alınır.
3. **Değişmezlik:** Next.js `Metadata` objelerini yeni obje olarak döndür, eskisini mutate etme.
4. **Tip güvenliği:** Yeni fonksiyonlara explicit dönüş tipi, `any` yok; external input için `unknown` + Zod.
5. **`console.log` yok.** Hata loglama `console.error` (mevcut convention korunur).
6. **Asla `--no-verify` / hook bypass yok.**

---

### A1. `metadataBase` + global canonical + robots metadata (layout)

**Dosya:** `src/app/layout.tsx`

**Değişiklik:**
- `metadataBase: new URL('https://www.kasguide.de')` ekle.
- Global `alternates.canonical: '/'` (root) ekle — her sayfa kendi canonical’ını override eder.
- Global `robots` objesini genişlet: `googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }`.
- `openGraph.url` ve `twitter.site` hostlarını `www.kasguide.de`’ye al.
- Ana sayfa title/description’larını **sadece global default** olarak bırak; ana sayfa spesifik title/description’u A2’de `src/app/page.tsx` içinden override edeceğiz.

**Kabul kriteri:**
- `view-source:` ile ana sayfada `<link rel="canonical" href="https://www.kasguide.de/">` görünür.
- Tüm OG URL’leri `https://www.kasguide.de` ile başlar.
- `build` hatasız, `lint` clean.

---

### A2. Ana sayfa on-page: H1, title, description, editorial içerik, FAQ, JSON-LD

**Dosya:** `src/app/page.tsx` ve yeni `src/features/home/components/home-intro-section.tsx`, `src/features/home/components/home-faq-section.tsx`, `src/features/home/components/home-jsonld.tsx`

#### A2.1. Sayfa seviyesinde metadata export’u
Ana sayfaya **özel** `export const metadata: Metadata` ekle (mevcut `dynamic = 'force-dynamic'` korunur):

- `title: 'Kaş Rehberi | Gezilecek Yerler, Restoranlar ve Tatil İpuçları'`
- `description: 'Kaş rehberi ile tatilinizi planlayın. Kaş’ta gezilecek yerler, restoranlar, plajlar, konaklama önerileri ve yerel travel tips tek yerde.'`
- `alternates: { canonical: '/' }`
- `openGraph: { url: '/', type: 'website', locale: 'tr_TR', siteName: 'Kaş Guide' }`

#### A2.2. H1 ve editorial intro bölümü (`HomeIntroSection`)
**Yeni dosya:** `src/features/home/components/home-intro-section.tsx`

Server component, semantic HTML. İçerik (600–900 kelime hedefi, ilk 150 kelimede “Kaş rehberi”, “Kaş gezilecek yerler”, “Kaş restoranları”, “Kaş’ta nerede kalınır” geçmeli):

- `<h1>Kaş Rehberi: Gezilecek Yerler, Restoranlar, Plajlar ve Yerel Öneriler</h1>`
- 4 alt bölüm `<h2>`:
  1. **Kaş Nasıl Bir Yer?** — destinasyon overview, kimler için uygun, atmosfer
  2. **Kaş’ta En Çok Ne Aranır?** — gezilecek yerler, plajlar, tekne turu, dalış, restoran, konaklama
  3. **Kasguide Ne Sunuyor?** — curated recommendations, kategori bazlı keşif, local perspective
  4. **Kaş Tatili Nasıl Planlanır?** — kısa tatil, hafta sonu, aile, çift, bütçe dostu
- Her `<h2>` sonunda **en az 2 iç link** (nofollow değil). Anchor örnekleri:
  - “Kaş gezilecek yerler rehberi” → `/kas-gezilecek-yerler`
  - “Kaş restoran önerileri” → `/kas-restoran-onerileri`
  - “Kaş’ta nerede kalınır” → `/kas-nerede-kalinir`
  - “Kaş plajları” → `/kas-plajlari`
  - “Kaş tekne turu rehberi” → `/kas-tekne-turu`
  - “Kaş 3 günlük gezi planı” → `/kas-3-gunluk-gezi-plani`
- Son paragrafta “Son güncelleme: Nisan 2026 — editoryal olarak gözden geçirildi.” trust bloğu.

**Yerleşim sırası (`src/app/page.tsx` içinde):**
```
HeroCarousel
HomeIntroSection      // YENİ — H1 + editorial metin burada
CategorySection
NewsAnnouncementsCarousel
HomeFaqSection        // YENİ
HomePromoSection
WhatsAppCommunitySection
HomeJsonLd            // YENİ — WebSite + Organization + FAQPage + ItemList script’leri
footer
```

#### A2.3. FAQ bölümü (`HomeFaqSection`)
**Yeni dosya:** `src/features/home/components/home-faq-section.tsx`

En az 6 soru, her cevap 40–80 kelime, cevap ilk cümlede verilir (GEO uyumu):

1. Kaş’ta kaç gün kalınır?
2. Kaş’ta ilk kez gelenler için en iyi bölge hangisi?
3. Kaş’ta en iyi plajlar hangileri?
4. Kaş’ta nerede kahvaltı yapılır?
5. Kaş’ta dalış için en uygun dönem ne zaman?
6. Kaş bütçe dostu bir destinasyon mu?

Her soru `<h3>` + `<p>` olarak render edilmeli; `<details>` kullanılacaksa da `<summary>` metni `<h3>` semantiğini bozmadan kalmalı. Schema ayrı enjekte edilir (A2.4).

#### A2.4. JSON-LD (`HomeJsonLd`)
**Yeni dosya:** `src/features/home/components/home-jsonld.tsx`

Server component, `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />` ile dört graf:

1. `@type: Organization` (`name`, `url`, `logo`, `sameAs` → Instagram/Facebook/X/WhatsApp/mail)
2. `@type: WebSite` (`url`, `name`, `inLanguage: 'tr-TR'`, `potentialAction: SearchAction` → `urlTemplate: 'https://www.kasguide.de/?q={search_term_string}'`)
3. `@type: CollectionPage` + embedded `ItemList` (son 9 yayınlanan yer; API yoksa statik top list kullanılabilir)
4. `@type: FAQPage` — yukarıdaki 6 soru/cevap (A2.3 ile %100 eşleşmeli)

**Kabul kriterleri (A2 toplu):**
- Ana sayfada **tek** `<h1>` var ve içeriği yukarıdaki string.
- Rich Results Test `FAQPage` + `WebSite` + `Organization` + `ItemList` valid.
- Kelime sayısı (render edilen body, script hariç) ≥ 600.
- İlk 150 kelimede en az 4 primary keyword geçiyor.
- Tüm iç linkler `<Link>` ile, anchor text spam değil, açıklayıcı.

---

### A3. `robots.ts` (route-based)

**Yeni dosya:** `src/app/robots.ts`

Next.js’in `MetadataRoute.Robots` API’si kullanılır (sadece bir `robots.ts` export).

**İçerik:**
- `host: 'https://www.kasguide.de'`
- `sitemap: 'https://www.kasguide.de/sitemap.xml'`
- `rules`:
  - `{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/*', '/api/*', '/review', '/result', '/planner/private', '/*?q=*', '/*?debug=*'] }`
  - `/api/*` kapalı ama `/api/og` vb. gelecek public endpoint’ler açılacaksa ayrı izin satırı eklenir.

**Kabul kriteri:**
- `curl https://www.kasguide.de/robots.txt` → valid, sitemap satırı var.
- Google Search Console “robots.txt tester”: `/admin`, `/api/admin/*` bloklu; `/`, `/mekan/x`, `/kas-gezilecek-yerler` allowed.

---

### A4. `sitemap.ts` (dinamik)

**Yeni dosya:** `src/app/sitemap.ts`

**İçerik (server side):**
- `lastModified` için `new Date()` fallback.
- URL kümeleri:
  - **Statik core:** `/`, `/biz-kimiz`, `/iletisim`, `/faq`, `/mekan-oner`
  - **SEO landing (Sprint 2’de eklenecek; stub olsa da sitemap’e eklenmez — sadece gerçekten yayında olan URL’ler girer):** Bu adımda henüz EKLENMEZ (thin content engeli).
  - **Detay:** `getPublishedPlaceBySlug` yerine `src/lib/public-place-store.ts` içinden yayınlanmış (status = `approved`) tüm place slug’larını çeken bir `listPublishedPlaceSitemapEntries()` helper ekle (`slug`, `updated_at`).
  - **Haberler/Duyurular:** `src/lib/updates-store.ts` üzerinden yayınlanmış slug’lar (`/haberler/[slug]`, `/duyurular/[slug]`).
- Her entry `changeFrequency` + `priority` alanları:
  - `/` → weekly, 1.0
  - statik trust → monthly, 0.5
  - mekan detay → weekly, 0.7
  - haber/duyuru → monthly, 0.6
- Thin / unpublished / pending kayıtlar **kesinlikle dahil edilmez**.

**Helper eklenecek:** `src/lib/public-place-store.ts` içine
```ts
export async function listPublishedPlaceSitemapEntries(): Promise<Array<{ slug: string; updatedAt: string }>> { ... }
```
Query: `status = 'approved' AND published_at IS NOT NULL`.

**Kabul kriteri:**
- `https://www.kasguide.de/sitemap.xml` valid XML (Chrome + sitemap validator).
- İçinde admin/api/review URL’i **yok**.
- Tüm `<loc>` `https://www.kasguide.de` ile başlıyor.
- Search Console’a manuel submit edildi.

---

### A5. `/mekan/[slug]` canonical + JSON-LD (LocalBusiness/Restaurant/…)

**Dosya:** `src/app/mekan/[slug]/page.tsx`

#### A5.1. `generateMetadata` içine canonical
Dönüş objesine:
```ts
alternates: {
  canonical: `/mekan/${slug}`,
},
openGraph: { ..., url: `https://www.kasguide.de/mekan/${slug}` },
robots: place.status === 'approved' ? undefined : { index: false, follow: false },
```
(metadataBase A1’de geldi, bu yüzden absolute URL Next.js tarafından otomatik çözülür; OG `url` yine mutlak verilir.)

#### A5.2. Kategori → `schema.org` tipi eşlemesi
**Yeni yardımcı:** `src/lib/place-schema.ts`

```ts
export function mapCategoryToSchemaType(categoryId: string | null | undefined): string {
  switch (categoryId) {
    case 'restoran':
    case 'meyhane':
    case 'kahvalti':
      return 'Restaurant'
    case 'cafe':
      return 'CafeOrCoffeeShop'
    case 'bar':
      return 'BarOrPub'
    case 'oteller':
      return 'LodgingBusiness'
    case 'plaj':
    case 'tarih':
    case 'doga':
    case 'gezi':
      return 'TouristAttraction'
    case 'carsi':
      return 'Store'
    case 'dalis':
    case 'aktivite':
    case 'etkinlik':
      return 'LocalBusiness'
    default:
      return 'LocalBusiness'
  }
}
```

#### A5.3. JSON-LD enjeksiyonu
`PlaceDetailPage` render’ında, hero’dan önce server-side `<script type="application/ld+json">` ile iki graf:
1. **Place schema** — `@type` = `mapCategoryToSchemaType(place.categoryPrimary)`, `name`, `description` (longDescription), `image` (imageUrls), `url`, `address` (varsa `PostalAddress`), `geo` (varsa `GeoCoordinates`), `telephone`, `sameAs` (website).
2. **BreadcrumbList** — `Ana Sayfa → {Kategori Label} → {Place name}`. Kategori label için `getPlaceCategoryLabel`, kategori URL geçici olarak `/#categories` (Sprint 2’de kategori landing gelince güncellenecek).

#### A5.4. Editorial block tutarlılığı
Şu an sadece `Özet Bilgiler` `<h2>` + `longDescription` var. **Bu adımda ek yazı zorunlu değil**; ancak çok kısa `longDescription` durumunda `robots: noindex` fallback’ı:
```ts
if (!place.longDescription || place.longDescription.trim().split(/\s+/).length < 60) {
  return { ...metadata, robots: { index: false, follow: true } }
}
```
Bu sayede thin detail sayfaları indekse girmez (Bölüm B’de içerik genişletme planı var).

**Kabul kriteri:**
- Rich Results Test bir `restoran` detay URL’sinde `Restaurant` + `BreadcrumbList` valid.
- `view-source` içinde `<link rel="canonical" href="https://www.kasguide.de/mekan/…">` var.
- `status != approved` veya çok kısa longDescription durumunda `<meta name="robots" content="noindex, follow">` var.

---

### A6. `/admin/*`, `/api/*`, `/result`, `/planner` noindex

**Dosyalar:**
- `src/app/admin/layout.tsx` (zaten var) → `export const metadata = { robots: { index: false, follow: false } }` ekle.
- `src/app/result/page.tsx` → `robots: { index: false, follow: false }`.
- `src/app/planner/page.tsx` → şu anki planner **kullanıcıya açık mı?** Açıksa indexleme kalır, değilse noindex. (İçerik review sonrası karar; default: **noindex**.)
- `src/app/mekan-oner/page.tsx` → form sayfası olduğundan `robots: { index: true, follow: true }` (user-intent değerli); canonical self-ref eklensin.

**Kabul kriteri:** `/admin` ve `/result` sayfalarında `<meta name="robots" content="noindex, nofollow">` var.

---

### A7. `/biz-kimiz`, `/iletisim`, `/faq`, `/mekan-oner` metadata + canonical

**Her biri için** sayfanın başına:
```ts
export const metadata: Metadata = {
  title: '...',       // her sayfa için uniq, 50–60 karakter
  description: '...', // 140–160 karakter
  alternates: { canonical: '/biz-kimiz' },
  openGraph: { url: '/biz-kimiz', type: 'website', locale: 'tr_TR', siteName: 'Kaş Guide' },
}
```

Önerilen title/description’lar:

| URL | Title | Meta Description |
|---|---|---|
| `/biz-kimiz` | Biz Kimiz \| Kaş Guide Editoryal Ekibi | Kaş Guide nasıl kuruldu, editoryal yaklaşımımız ne, mekanları nasıl seçiyoruz? Yerel uzman ekibimizi ve misyonumuzu tanıyın. |
| `/iletisim` | İletişim \| Kaş Guide | Kaş Guide ekibine ulaşın: e-posta, WhatsApp ve sosyal medya. Öneri, işbirliği ve mekan ekleme talepleri için iletişim bilgileri. |
| `/faq` | Sık Sorulan Sorular \| Kaş Guide | Kaş tatili, konaklama, plajlar ve mekan önerileri hakkında en çok sorulan soruların yanıtlarını Kaş Guide SSS sayfasında bulun. |
| `/mekan-oner` | Mekan Öner \| Kaş Guide’a Yeni Yer Ekle | Kaş’ta beğendiğin bir mekanı Kaş Guide’a önermek için formu doldur. Editoryal inceleme sonrası yayımlanır. |

FAQ sayfasına **bu sprint içinde** de JSON-LD `FAQPage` schema eklenmeli — veri kaynağı `src/lib/faq-data.ts`. Kod:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    }),
  }}
/>
```

**Kabul kriteri:** 4 sayfa için canonical + uniq title/description, FAQ’ta valid `FAQPage` schema.

---

### A8. Görsel / CWV hijyeni (minimum viable)

**Dosya:** `src/app/mekan/[slug]/page.tsx` (hero `<img>`) ve hero carousel.

- Detay hero’daki `<img>` → `next/image` (remotePatterns zaten Supabase + Unsplash için açık, ek domain eklenmesi gerekirse `next.config.ts` güncellenir).
- Tüm `<img>` tag’lerinde `width` + `height` veya `fill` + parent sized.
- Hero’larda `priority` (şu an `fetchPriority="high"` var, `next/image priority` ile değiştir).
- Carousel ve kategori kartlarında `sizes` attribute ile responsive image.
- `alt` değeri boş/placeholder değil: `place.name` + short desc parçası.

**Kabul kriteri:** Lighthouse Mobile LCP hedef < 3.5s, CLS < 0.1 (PageSpeed Insights prod).

---

### A9. `next.config.ts` ve host redirect

**Dosya:** `next.config.ts`

- `async redirects()` ile apex → www yönlendirmesi:
  ```ts
  {
    source: '/:path*',
    has: [{ type: 'host', value: 'kasguide.de' }],
    destination: 'https://www.kasguide.de/:path*',
    permanent: true,
  }
  ```
- `trailingSlash: false` (default ama açık yaz).
- `async headers()` ile global:
  - `X-Robots-Tag: all` default (override edilebilir)
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

**Uyarı:** `output: 'standalone'` mevcut; Coolify deployment’ta redirect’lerin çalıştığını `curl -I https://kasguide.de` ile doğrula.

**Kabul kriteri:** `curl -I https://kasguide.de/mekan/x` → 308/301 → `https://www.kasguide.de/mekan/x`.

---

### A10. Sprint 1 Definition of Done (GLM 5.1 kontrol listesi)

- [ ] A1 — `metadataBase` + global canonical, OG URL’ler `www.kasguide.de`
- [ ] A2.1 — Ana sayfa kendi `metadata` export’u
- [ ] A2.2 — `HomeIntroSection` eklendi, tek H1, ≥600 kelime
- [ ] A2.3 — `HomeFaqSection` 6 soru
- [ ] A2.4 — `HomeJsonLd` (WebSite + Organization + CollectionPage/ItemList + FAQPage) valid
- [ ] A3 — `src/app/robots.ts`
- [ ] A4 — `src/app/sitemap.ts` + `listPublishedPlaceSitemapEntries` helper
- [ ] A5 — `/mekan/[slug]` canonical + JSON-LD + thin-content noindex
- [ ] A6 — `/admin`, `/result`, `/planner` noindex
- [ ] A7 — `/biz-kimiz`, `/iletisim`, `/faq`, `/mekan-oner` metadata + `/faq` FAQPage schema
- [ ] A8 — `next/image` adaptation (hero), `alt`/`sizes`
- [ ] A9 — apex→www redirect + security headers
- [ ] `npm run build` hatasız, `npm run lint` hatasız
- [ ] Rich Results Test: `WebSite`, `Organization`, `FAQPage`, `Restaurant` (örnek detay), `BreadcrumbList` valid
- [ ] Search Console’a `sitemap.xml` submit

---

## Bölüm B — Sonra Yapılabilecekler (Sprint 2 → 4, içerik & büyüme)

> Bu bölüm içerik ağırlıklıdır; GLM 5.1 sonrası insan editoryal + ajan workflow ile yürür. Her madde, mimari ve SEO zinciriyle birlikte tanımlandı.

### B1. Kategori Landing Page Mimari (`/kategori/[slug]` + redirects)

**Karar:** Planda önerilen SEO-friendly URL’leri (`/kas-gezilecek-yerler`, `/kas-restoran-onerileri` …) mevcut veri modeliyle temiz bağlamak için:

- Dinamik route: `src/app/kategori/[slug]/page.tsx` — parametrik, `categories.ts`’den feed.
- Vanity SEO URL’leri `next.config.ts` `rewrites()` içinden dinamik route’a bağlanır (redirect değil; canonical yine vanity URL’de kalır):
  ```ts
  async rewrites() {
    return [
      { source: '/kas-gezilecek-yerler', destination: '/kategori/gezi' },
      { source: '/kas-restoran-onerileri', destination: '/kategori/restoran' },
      { source: '/kas-kahvalti-mekanlari', destination: '/kategori/kahvalti' },
      { source: '/kas-barlar-ve-gece-hayati', destination: '/kategori/bar' },
      { source: '/kas-plajlari', destination: '/kategori/plaj' },
      { source: '/kas-nerede-kalinir', destination: '/kategori/oteller' },
      { source: '/kas-butik-oteller', destination: '/kategori/oteller?segment=boutique' },
      { source: '/kas-dalis-noktalari', destination: '/kategori/dalis' },
      { source: '/kas-tekne-turu', destination: '/kategori/aktivite?tag=boat' },
      // vb.
    ]
  }
  ```
- Page’in canonical değeri **vanity URL** olmalı (`alternates.canonical: '/kas-gezilecek-yerler'`), `/kategori/gezi` **noindex** veya `canonical` olarak vanity URL’e bağlı.
- URL eşleme tablosu (kod-referanslı):

| Vanity URL | Kategori ID | Ekstra filtre |
|---|---|---|
| `/kas-gezilecek-yerler` | `gezi` | — |
| `/kas-yapilacak-seyler` | `aktivite` | — |
| `/kas-restoran-onerileri` | `restoran` | — |
| `/kas-kahvalti-mekanlari` | `kahvalti` | — |
| `/kas-cafe-onerileri` | `cafe` | — |
| `/kas-meyhane-onerileri` | `meyhane` | — |
| `/kas-barlar-ve-gece-hayati` | `bar` | — |
| `/kas-plajlari` | `plaj` | — |
| `/kas-dalis-noktalari` | `dalis` | — |
| `/kas-tekne-turu` | `aktivite` | `tag=boat` |
| `/kas-oteller` | `oteller` | — |
| `/kas-butik-oteller` | `oteller` | `segment=boutique` |
| `/kas-pansiyonlar` | `oteller` | `segment=guesthouse` |
| `/kas-nerede-kalinir` | (meta hub) | editorial |
| `/kasta-nerede-ne-yenir` | (meta hub) | editorial |

> `oteller` + `segment` parametresinin veri modelinde karşılığı: `items.attributes->>'accommodation_type'` alanında `boutique|guesthouse|hotel|resort|apartment`. Bu alan yoksa bir migration gerekir (Bölüm B7).

**Template yapısı (`kategori/[slug]/page.tsx`):**
- `<h1>Kaş {Kategori} Rehberi</h1>`
- **Quick Answers** bloğu (3 soru/cevap, GEO)
- **Shortlist / Best Picks** — en iyi 5 mekan, editoryal sıralama (manual curate alanı: `items.attributes->>'curation_rank'`)
- **Area Breakdown** — merkez / yarımada / Patara / Kekova
- **Comparison block** — tablo veya matrix (fiyat segmenti × atmosfer × hedef kitle)
- **Tam liste** — o kategoride yayında olan tüm mekanlar (ItemList schema ile)
- **FAQ** (4–6 soru)
- **İç linkler** — ilgili diğer kategori sayfaları + ilgili itinerary
- **“Son güncelleme + editoryal inceleme” trust bloğu**
- JSON-LD: `CollectionPage` + `ItemList` (positioned) + `BreadcrumbList` + `FAQPage`

### B2. 12 öncelikli landing page içerik brief’leri

Her sayfa için content brief (H1 / Title / Meta / Outline / Internal Links / JSON-LD / Uzunluk hedefi 1200–1800 kelime):

1. `/kas-gezilecek-yerler`
2. `/kas-yapilacak-seyler`
3. `/kas-restoran-onerileri`
4. `/kas-kahvalti-mekanlari`
5. `/kas-barlar-ve-gece-hayati`
6. `/kas-nerede-kalinir` *(editorial meta hub, kategori değil)*
7. `/kas-butik-oteller`
8. `/kas-plajlari`
9. `/kas-tekne-turu`
10. `/kas-dalis-noktalari`
11. `/kas-3-gunluk-gezi-plani` *(Article + `TravelAction` / `TouristTrip` JSON-LD)*
12. `/kas-tatil-maliyeti` *(Article + `Dataset` veya `FAQPage`)*

**Meta/Title/H1** Bölüm 6 kaynak planındaki öneriler birebir kullanılır.

### B3. GEO/AI cevaplanabilirlik katmanı

Her landing ve detay sayfasında:
- İlk paragraf **cevap-önce** format (“Kaş’ta en iyi X şunlardır: …”).
- **Ref blokları:** her iddia için tarih + editoryal onay işareti (structured data’da `dateModified` + `reviewedBy`).
- **LLM friendly:** liste + tablo + karşılaştırma kombinasyonu.
- **Entity coverage:** Kaş, Antalya, Çukurbağ Yarımadası, Kaputaş, Patara, Kekova, Meis, Likya Yolu, Uluburun batığı — her landing’te doğal geçiş.
- **llms.txt desteği:** `public/llms.txt` oluştur (GEO best practice): site özeti + en önemli 20 URL + update cadence.

### B4. İç linkleme & anchor politikası

- `src/lib/internal-links.ts` altında **curated anchor→URL map** tanımla; kategori sayfaları ve mekan detayları render edilirken bu map üzerinden kontekstüel 3–5 link otomatik eklensin (boilerplate farmı olmadan).
- Anchor kuralları: “tıkla/detay/daha fazla” yasak; exact-match ve descriptive karışımı (örn. “Kaş kahvaltı mekanları rehberi”).
- Her kategori landing en az:
  - 1 link → ana sayfa hub
  - 3 link → ilgili diğer kategori/landing
  - 5 link → öne çıkan mekan detayları
  - 1 link → ilgili article (`/kas-3-gunluk-gezi-plani` vb.)
- Mekan detayında (`/mekan/[slug]`): “Benzer mekanlar” modülü (aynı kategori, farklı mahalle), “Nerede kalınır?” / “Nerede yenir?” cross-link’leri.

### B5. Schema derinleştirme (detay + article)

- `/mekan/[slug]` — `Review` (varsa kullanıcı/editör yorumu), `aggregateRating` (aktif edilmeden önce en az 5 review olmalı, uydurma rating yasak).
- `opening_hours` alanı varsa `openingHoursSpecification` ekle.
- Article sayfaları için `Article` + `author` + `publisher` + `datePublished` + `dateModified`.
- `TouristDestination` üst schema’sı ana hub (`/`) altında, `TouristAttraction`/`LocalBusiness` alt öğeleri ile bağlanabilir.

### B6. EEAT & trust modülleri

- `/rehber-nasil-hazirlaniyor` yeni sayfa (Sprint 4): editoryal yöntem, bağımsızlık, partner ayrımı.
- Her landing altında `EditorialTrustBlock` component: son güncelleme, inceleyen editör adı/rolü, güncelleme sıklığı notu.
- `src/lib/editorial-meta.ts`: slug → `{ reviewer, lastReviewedAt, updateCadence }` map; component bundan besleniyor.

### B7. Veri modeli genişletme (minor migration)

Gerekli alanlar:
- `items.attributes.accommodation_type` (`boutique|guesthouse|hotel|resort|apartment|pension`)
- `items.attributes.price_segment` (`budget|mid|premium|luxury`)
- `items.attributes.area` (`center|peninsula|patara|kekova|kalkan_border|village`)
- `items.attributes.tags[]` (`boat|sunset|family|romantic|dog_friendly|view|breakfast|vegan|…`)
- `items.attributes.curation_rank` (integer, kategori içi sıra)
- `items.attributes.last_editorial_review_at` (ISO date)

Migration: `supabase/migrations/2026XXXX_editorial_attributes.sql` — JSONB olduğundan şema-less; sadece doküman / Zod validator güncellenir (`src/lib/api-schemas.ts`).

### B8. Performans & render hijyeni ileri

- Hero carousel’i server-first render + client hydration; kritik CSS hero için inline.
- `CategorySection`’da `<picture>` / `<Image fill sizes="(min-width: 1024px) 25vw, 50vw">`.
- `unstable_cache` ile `listPublishedPlaceSitemapEntries`, kategori listeleri; revalidate 900s.
- `next/font` ile font CLS sıfırla (mevcut kullanım kontrol edilsin).
- Lighthouse CI GitHub Actions: her PR’da Perf/SEO/Best Practices/Accessibility skor ≥ 85.

### B9. hreflang & EN içerik yol haritası

Ana sayfa Türkçe kalır; EN sayfa eklenmesi durumunda:
- `src/app/en/...` subtree.
- `alternates.languages` ile `tr-TR` ↔ `en-US` çapraz bağlantı.
- `sitemap.ts` her URL için `alternates`.
- EN içerik Sprint 3 sonrası.

### B10. Off-page / backlink-worthy assets

Sprint 3–4 backlog:
- “Kaş plaj karşılaştırması” interaktif harita + tablo (linkable).
- “Kaş bütçe rehberi” — gerçek fiyat örnekleriyle, aylık güncelleme.
- “Kaş hidden gems” — sadece Kaş Guide tarafından gün yüzüne çıkarılmış 10 mekan.
- Yerel yayın ve travel blog outreach listesi (`docs/outreach/*`, repo dışı CRM’e bağlanabilir).

### B11. Analytics & ölçüm

- GA4 + GSC + Plausible (opsiyonel) entegrasyonu.
- `src/app/layout.tsx` içine Consent-aware analytics loader (KVKK/GDPR uyumlu).
- Keyword cluster dashboard (GSC API): guide / things-to-do / restaurants / stay / planning.
- KPI panosu: haftalık impressions, CTR, avg position, indexed count, referring domains, AI Overview görünürlüğü.

### B12. Admin / editör UX iyileştirmeleri (SEO destek)

- `/admin/places` formuna **SEO meta alanları** ekle: custom meta title, meta description, FAQ pairs, H1 override, `noindex` toggle.
- Editoryal zorunluluk: kaydetmeden önce `longDescription` ≥ 120 kelime, en az 3 iç link placeholder, en az 1 FAQ.
- Publish aşamasında validator: `sitemap.ts` kapsamına alır, canonical kontrol.

### B13. Sprint takvimi (revize)

| Sprint | Kapsam | Sonuç |
|---|---|---|
| **Sprint 1 (Bölüm A)** | Teknik temel + ana sayfa hub | Indexability + home hub skorunu sıfırdan kabul edilebilire taşır |
| **Sprint 2 (B1, B2 #1–#4, B4, B11)** | Top 4 landing + iç linkleme + analytics | İlk organic kazanım dalgası |
| **Sprint 3 (B2 #5–#12, B3, B5, B7)** | Landing setini tamamla + GEO derinleştir + data model | GEO cevaplanabilirlik + long-tail kapsama |
| **Sprint 4 (B6, B10, B12, B9)** | EEAT + backlink asset + admin SEO + hreflang | Authority ve ölçek |

---

## Ek — GLM 5.1 için kısa brief (doğrudan yapıştırılabilir)

> Sen bir Next.js 15 App Router + TypeScript ajanısın. Aşağıdaki görevleri `bigconvert.md` Bölüm A’daki sıraya göre uygulayacaksın. Her adımdan sonra:
> 1. `npm run build` ve `npm run lint` çalıştır.
> 2. Değişiklikleri **küçük, konu odaklı commit’ler** halinde yap (Conventional Commits: `feat(seo): ...`, `fix(seo): ...`, `chore(seo): ...`).
> 3. Mevcut convention’ları koru: React Server Components default, `'use client'` sadece gerektiğinde, `'force-dynamic'` mevcut sayfalarda kalsın.
> 4. Hiçbir admin / API / review / draft URL’i indexlenebilir bırakma.
> 5. Bölüm A10 DoD listesinin her kutucuğu ✅ olana kadar durma. Tamamlanamayan maddelerde **nedeniyle birlikte** açıkça raporla; sessiz atlama yok.
> 6. `dangerouslySetInnerHTML` kullanırken `JSON.stringify(...)` zorunlu; HTML entity escape’i unutma.
> 7. Host her yerde `https://www.kasguide.de`; hardcoded `https://kasguide.de` kalmasın.
> 8. Content tarafında (A2.2 / A2.3 / A7) **placeholder Lorem yazma** — Bölüm A’da verilen başlıkları ve soruları birebir kullan, cevap paragraflarını editoryal tonda Türkçe yaz.
>
> Bittiğinde: diff özeti + DoD kontrol listesi + Rich Results Test URL sonuçları raporla.

---

*Son güncelleme: 2026-04-19 — Kaş Guide SEO/GEO master plan.*
