# Admin Panel Sidebar Layout — Tasarım

## Problem

Admin panelin üst navigasyon barı (`AdminSectionLinks`) her sayfada ayrı ayrı render ediliyor — ortak bir layout yok. Bu yüzden sayfa geçişlerinde nav bar kısa süreliğine kayboluyor/yeniden yerleşiyor ("oynuyor"). Ayrıca genel admin panel deneyimi görsel olarak sade kalmış; kullanıcı bunu soldan section'lı, daha premium ve kullanışlı bir panele çevirmek istiyor.

## Kapsam

- `/admin/places`, `/admin/hero-slides`, `/admin/updates`, `/admin/scrapers/news`, `/admin/scrapers/places`, `/admin/scrapers/places/[id]` sayfaları → yeni sabit sol sidebar layout'una geçer.
- `/admin` (şifre girişi / login ekranı) kapsam dışı — sidebar'sız, mevcut haliyle kalır.
- `/admin/review` ve `/admin/sweeps` sadece redirect sayfaları, değişmez.

## Mimari

### Route groups ile ayrım

```
src/app/admin/
  page.tsx                     # login — değişmez
  layout.tsx                   # sadece metadata (mevcut haliyle kalır)
  (dashboard)/
    layout.tsx                 # YENİ: sidebar + content shell
    places/page.tsx            # taşınır
    hero-slides/page.tsx       # taşınır
    updates/page.tsx           # taşınır
    scrapers/news/page.tsx     # taşınır
    scrapers/places/page.tsx   # taşınır
    scrapers/places/[id]/page.tsx  # taşınır
  review/page.tsx              # değişmez (redirect)
  sweeps/page.tsx              # değişmez (redirect)
```

`(dashboard)` route group parantezli olduğu için URL path'e yansımaz — `/admin/places` URL'i aynı kalır, sadece dosya konumu değişir.

### `(dashboard)/layout.tsx`

- İçinde `AdminSidebarActionsProvider` (Context) + iki kolonlu shell: sol `AdminSidebar`, sağ `<div className="admin-dashboard-content">{children}</div>`.
- Masaüstünde: `display: grid; grid-template-columns: 260px 1fr;` sidebar `position: sticky; top: var(--header-height); align-self: start;`.
- Dar ekranda (breakpoint ~900px): sidebar yatay bir üst çubuğa/collapse menüye döner (mevcut `admin-compact-nav` davranışına yakın, ama sidebar bileşeninin kendi responsive stiliyle).

### `AdminSidebar` bileşeni (yeni, `AdminSectionLinks`'in yerini alır)

- `usePathname()` ile aktif bölümü kendisi belirler — `current` prop'una gerek kalmaz.
- 4 sabit bölüm: Mekanlar, Hero, Haberler ve Duyurular, Scraper'lar — her biri ikon + etiket, aktif olan vurgulu (pill/arka plan + sol kenar çizgisi ile).
- Scraper'lar linki `/admin/scrapers/news`'e gider (mevcut davranış korunur); `/admin/scrapers/places*` altında da bu linkin aktif görünmesi için pathname `startsWith('/admin/scrapers')` kontrolü yapılır.
- Alt kısımda ayrı bir blok: "Yenile" aksiyonu (Context'ten okunur) + "Çıkış yap" butonu.
- İkonlar: mevcut kategori ikon setiyle tutarlı basit inline SVG (harici ikon kütüphanesi eklenmez).

### Yenile aksiyonunun taşınması (Context)

Şu an her sayfa kendi `refreshLabel`/`refreshing`/`onRefresh`'ini `AdminSectionLinks`'e prop olarak veriyordu. Sidebar artık layout'ta olduğu için bu bilgi sayfadan yukarı "yayınlanmalı":

- `AdminSidebarActionsContext` — `{ setRefreshAction: (action: { label: string; refreshing: boolean; onRefresh: () => void } | null) => void }`
- Yeni hook: `useAdminSidebarRefreshAction({ label, refreshing, onRefresh })` — sayfa mount olduğunda context'e kaydeder, unmount'ta temizler (`useEffect`).
- Sayfa geçişlerinde bir önceki sayfanın aksiyonu otomatik temizlenip yenisi kaydedilir; sidebar her zaman "o an aktif sayfanın" yenile aksiyonunu gösterir.
- Aksiyon kaydedilmemişse (örn. ileride eklenecek aksiyonsuz bir sayfa) sidebar'da yenile butonu gizlenir.

### Sayfa içerikleri

Her taşınan sayfadan `AdminSectionLinks` importu ve render'ı kaldırılır, yerine `useAdminSidebarRefreshAction(...)` çağrısı eklenir. `<main className="container admin-shell admin-shell-places ...">` sarmalayıcıları olduğu gibi kalır (iç içerik yapıları değişmez) — sadece nav artık sayfanın içinde değil, üstteki layout'ta.

## Görsel yön

- Mevcut teal/glass paletle tutarlı: `--glass-white-surface` arka plan, `rgba(0, 168, 150, 0.14)` border, yumuşak gölge (`0 18px 42px rgba(17, 59, 58, 0.09)`), 20-24px border-radius.
- Aktif bölüm: sol kenarda ince teal çizgi + hafif dolgu arka plan (`rgba(0, 168, 150, 0.08)`), koyu teal metin (`#0b3b39`).
- Pasif bölüm: nötr gri metin (`rgba(15, 23, 42, 0.72)`), hover'da teal'e geçiş.
- İkon + etiket yan yana, üst kısımda küçük bir "Admin" eyebrow/logo alanı.
- Sidebar genişliği masaüstünde ~260px sabit; içerik alanı `minmax(0, 1fr)` ile taşmayı önler.

## Responsive davranış

- `>900px`: sol sidebar sabit (sticky), grid layout.
- `≤900px`: sidebar üstte yatay bir şerite döner; bölümler yatay scroll edilebilir kompakt liste halinde (mevcut `admin-compact-nav` mobil stiline benzer), yenile/çıkış aksiyonları şeridin sonunda kalır. Ayrı bir hamburger/drawer eklenmez — mevcut basit yatay nav deneyimi mobilde korunur, sadece görsel olarak iyileştirilir.

## Test / doğrulama

- Otomatik test altyapısı yok (proje Playwright/Jest kullanmıyor) — `npm run build` ve `npm run lint` ile tip/derleme doğrulaması yapılacak.
- Manuel doğrulama: dev server üzerinde `/admin` login → `/admin/places` → diğer sekmeler arası geçiş, sidebar'ın kaymadan sabit kaldığı, aktif vurgunun doğru sekmede olduğu, yenile butonunun her sayfada doğru aksiyonu tetiklediği, mobil genişlikte layout'un bozulmadığı kontrol edilecek.
