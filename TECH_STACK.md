# Kaş Guide - Teknoloji Yığını (Tech Stack)

Bu doküman, **Kaş Guide** projesinin geliştirilmesinde kullanılan temel teknolojileri, araçları ve mimari yaklaşımları özetlemektedir.

## 🏗 Temel Çerçeve ve Diller

- **[Next.js (v15+)](https://nextjs.org/)**: Projenin ana framework'ü olarak kullanılmıştır. App Router (`app/` dizini) mimarisi üzerine kuruludur.
- **[React (v19)](https://react.dev/)**: Kullanıcı arayüzü bileşenlerini oluşturmak için kullanılmıştır. Server Components ve Client Components (`'use client'`) mantığı bir arada çalışmaktadır.
- **[TypeScript](https://www.typescriptlang.org/)**: Tip güvenliği (type safety), daha az hata ve daha iyi geliştirici deneyimi sağlamak için projenin genelinde tercih edilmiştir.
- **[Node.js](https://nodejs.org/)**: Arka plan işlemleri ve veri çekme/işleme betikleri için kullanılmıştır. Projedeki script'ler Node'un dâhili TypeScript desteği (`--experimental-strip-types`) kullanılarak çalıştırılmaktadır.

## 🎨 Tasarım ve Stil (Styling)

- **Geleneksel CSS (CSS Modules & Globals)**: Projenin büyük bir kısmında özel CSS tasarımları (`globals.css`) ve CSS değişkenleri (CSS variables) kullanılmıştır. Medya sorguları (media queries) ve CSS Grid / Flexbox ile tam duyarlı (responsive) bir tasarım inşa edilmiştir.
- **[Tailwind CSS (v4)](https://tailwindcss.com/)**: Ekosisteme entegre olarak yapılandırılmıştır, PostCSS ile derlenmektedir. 
- **Modern UI Yaklaşımları**: Glassmorphism (bulanık arka planlar, yarı saydamlık), CSS Clamp, akıcı tipografi (fluid typography) ve modern gölgelendirmeler (box-shadow) yoğun olarak kullanılmıştır.

## 🗄️ Veritabanı ve Arka Uç (Backend)

- **[Supabase](https://supabase.com/)**: Projenin veritabanı, kimlik doğrulama (yetkilendirme) ve veri depolama (BaaS - Backend as a Service) çözümüdür. `@supabase/supabase-js` kütüphanesi aracılığıyla entegre edilmiştir. 
  - Mekan verileri, inceleme (review) kuyrukları, grid sweep operasyonları gibi tüm kalıcı veriler Supabase (PostgreSQL) üzerinde tutulmaktadır.

## 🔄 Veri Toplama ve İşleme (Data Ingestion)

Mekan bilgilerinin toplanması ve güncellenmesi için projeye entegre edilmiş güçlü bir veri işlem hattı (pipeline) bulunmaktadır:

- **Google Places API**: Grid bazlı alan taraması (`import-google-grid.ts`) yapılarak Google Haritalar'dan ham mekan bilgileri çekilir.
- **OpenStreetMap (OSM)**: Gerekli durumlarda alternatif veya ek harita/mekan verisi (`import-osm.ts`) toplamak için entegre edilmiştir.
- **Normalization & Deduplication**: Çekilen veriler direkt kullanıcıya sunulmaz; normalize edilir (`normalize-places.ts`), mükerrer (duplicate) kayıtlar tespit edilip temizlenir (`dedupe-places.ts`) ve bir inceleme kuyruğuna (review queue) alınır.
- **Admin Review Sistemi**: Yönetici paneli üzerinden toplanan veriler editör onayı ve düzeltmelerinden geçtikten sonra yayına alınır.

## 🛡️ Güvenlik ve Kimlik Doğrulama (Auth)

- **Admin Şifre Koruması (Password-based Gateway)**: Yönetici paneli ve hassas API uç noktaları (`/api/admin/*`), özel yetkilendirme (X-Admin-Password HTTP Header ve Client-side storage) kullanılarak korunmaktadır. Sunucu tarafında `lib/admin-auth.ts` üzerinden yetki doğrulama yapılmaktadır.

## 🚀 Dağıtım (Deployment) ve Optimizasyon

- **Next.js Caching & Revalidation**: Ana sayfa gibi statik ağırlıklı sayfalar `revalidate = 3600` (1 saat) ile önbelleğe alınarak yüksek performans sunar. API'ler ise dinamik `force-dynamic` yapıdadır.
- **Next.js Server Chunks Senkronizasyonu**: Dağıtım sürecinde (`postbuild` ve `prestart`) çalışan `sync-next-server-chunks.mjs` betiği, Vercel/Next.js ortamındaki parça (chunk) senkronizasyon sorunlarını çözer.
- **Bileşen Optimizasyonu**: Resim yüklemelerinde `next/image` yerine duruma göre yerel `img` takıları `fetchPriority="high"`, `loading="eager"` veya `lazy` nitelikleriyle kullanılarak performans yönetimi manuel olarak optimize edilmiştir.
