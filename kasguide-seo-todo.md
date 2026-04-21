# 🔍 kasguide.de – Teknik SEO TODO Dökümanı

> **Kaynak Rapor:** Spindora Profesyonel SEO Analiz Raporu
> **Analiz URL:** https://www.kasguide.de/
> **Rapor Tarihi:** 21.04.2026
> **Analiz ID:** 1bcb6c44
> **Genel Skor:** 33/100 (Zayıf) · **Teknik SEO:** 42/100 · **İçerik Kalitesi:** 25/100
> **Toplam Sorun:** 65 (33 Kritik · 32 Orta · 0 Yüksek · 0 Düşük)

---

## 📌 Yönetici Özeti

Site, teknik altyapı açısından çalışır durumda (schema.org işaretlemesi, iç link yapısı, makul kelime sayısı mevcut) ancak **on-page SEO optimizasyonu ve içerik derinliği kritik düzeyde yetersiz**. Ana problem alanları:

1. **Hedeflenen 15 anahtar kelimenin 10 tanesi sitede hiç geçmiyor** (tekne turu, otel önerileri, gece hayatı, dalış noktaları vb.).
2. **Title ve Meta Description hedef anahtar kelimeler için optimize edilmemiş.**
3. **Sayfada 2 adet H1 etiketi var** – SEO standartlarına aykırı.
4. **6 adet kırık link** mevcut – hem UX hem crawl bütçesi için zararlı.
5. **BreadcrumbList ve WebPage schema'ları eksik.**
6. **Görsellerde width/height öznitelikleri eksik** – CLS (Cumulative Layout Shift) riski.

Bu döküman, sorunları öncelik sırasına göre aksiyona dönüştürülebilir maddeler halinde listeler.

---

## 🎯 Anahtar Kelime Durum Tablosu

| # | Anahtar Kelime | Varlık | Öne Çıkma | Durum |
|---|---|---:|---:|---|
| 1 | Kaş gezi rehberi | 80 | 70 | 🟡 Kısmi – Title'da "Kaş Rehberi" olarak geçiyor |
| 2 | Kaş gezilecek yerler | 100 | 95 | 🟢 Mükemmel |
| 3 | Kaş günlük gezi planı | 60 | 45 | 🟡 İçerikte var, meta'ya eklenmeli |
| 4 | Kaş plaj önerileri | 50 | 35 | 🟡 İçerikte var, meta'da yok |
| 5 | Kaş en iyi restoranlar | 40 | 30 | 🟡 İçerikte var, Title/H1'de yok |
| 6 | Kaş yapılacak aktiviteler | 0 | 0 | 🔴 Eksik |
| 7 | Kaş gece hayatı | 0 | 0 | 🔴 Eksik |
| 8 | Kaş dalış noktaları | 0 | 0 | 🔴 Eksik |
| 9 | Kaş otel önerileri | 0 | 0 | 🔴 Eksik |
| 10 | Kaş tekne turu | 0 | 0 | 🔴 Eksik |
| 11 | Kaş merkez gezilecek yerler | 0 | 0 | 🔴 Eksik |
| 12 | Kaş nerede ne yenir | 0 | 0 | 🔴 Eksik |
| 13 | Kaş tatil rehberi | 0 | 0 | 🔴 Eksik |
| 14 | Kaş koyları listesi | 0 | 0 | 🔴 Eksik |
| 15 | Kaş en güzel plajlar | 0 | 0 | 🔴 Eksik |

---

## 🚨 FAZ 1 – KRİTİK (İlk 48 Saat İçinde Tamamla)

Bu maddeler, arama motorlarının sayfanızı nasıl indekslediğini doğrudan etkiler. En düşük eforla en yüksek kazancı sağlar.

### TODO-1.1 · Title Etiketini Optimize Et

- [ ] **Mevcut:** `Kaş Rehberi | Gezilecek Yerler, Restoranlar ve Tatil İpuçları` (61 karakter – sınırda)
- [ ] **Yeni Öneri:** `Kaş Gezi Rehberi | Gezilecek Yerler ve Tatil İpuçları` (55 karakter)
- [ ] **Neden:** "Kaş gezi rehberi" tam eşleşmesi sağlanacak, karakter limitine uyulacak.
- [ ] **Nerede:** `<head>` içindeki `<title>` etiketi (muhtemelen `index.html` veya framework layout dosyası).

```html
<title>Kaş Gezi Rehberi | Gezilecek Yerler ve Tatil İpuçları</title>
```

### TODO-1.2 · Meta Description'ı Genişlet

- [ ] **Mevcut:** 136 karakter (ideal 150-160).
- [ ] **Yeni Öneri:**

```html
<meta name="description" content="Kaş gezi rehberi ile tatilinizi planlayın! Kaş gezilecek yerler, en iyi restoranlar, plaj önerileri, dalış noktaları ve konaklama ipuçları güncel bilgilerle burada.">
```

- [ ] **Karakter:** ~178 → 155-160 arası olacak şekilde kısalt.
- [ ] **Neden:** CTR artışı, birden fazla anahtar kelimenin kapsanması.

### TODO-1.3 · H1 Etiketini Tekilleştir

- [ ] Sayfada şu an **2 adet H1** var:
  1. `"Kaş'ta suyun altı da en az kıyıları kadar büyüleyici."`
  2. `"Gezilecek yerler, restoranlar, plajlar ve yerel öneriler"`
- [ ] **Aksiyon:**
  - Hero başlığı olan ilk metin **H1** olarak kalsın (marka tonunu koruyor).
  - İkinci metin **H2**'ye dönüştürülsün.
- [ ] **Alternatif:** SEO açısından daha güçlü olması için H1'i şu şekilde güncellemeyi düşünün:

```html
<h1>Kaş Gezi Rehberi – Gezilecek Yerler, Plajlar ve Yerel Öneriler</h1>
```

### TODO-1.4 · Kırık Linkleri Düzelt (6 adet)

- [ ] Raporda "Kırık Link: 6" olarak belirtilmiş ancak spesifik URL'ler listelenmemiş.
- [ ] **Aksiyon:**
  - Screaming Frog veya Ahrefs Site Audit ile tam listeyi çıkar.
  - Alternatif olarak ücretsiz: [https://www.deadlinkchecker.com](https://www.deadlinkchecker.com)
  - Her kırık link için: 301 yönlendirme ver **veya** HTML'den kaldır.

---

## 📝 FAZ 2 – İÇERİK GENİŞLETMESİ (İlk 2 Hafta)

En büyük kayıp: 15 hedef kelimenin 10'u sitede hiç geçmiyor. Bu, **tam bir içerik boşluğu** demek.

### TODO-2.1 · Eksik Anahtar Kelimeler İçin Bölüm/Alt Sayfa Oluştur

Her bir eksik anahtar kelime için ya ana sayfada yeni bir bölüm ekleyin ya da **kendine ait alt sayfa** açın (daha güçlü SEO etkisi için önerilen yaklaşım).

| Anahtar Kelime | Önerilen Alt Sayfa URL'si | Tahmini İçerik Uzunluğu |
|---|---|---:|
| Kaş tekne turu | `/kas-tekne-turu` | 800-1200 kelime |
| Kaş otel önerileri | `/kas-otel-onerileri` | 1000-1500 kelime |
| Kaş dalış noktaları | `/kas-dalis-noktalari` | 800-1200 kelime |
| Kaş gece hayatı | `/kas-gece-hayati` | 600-900 kelime |
| Kaş yapılacak aktiviteler | `/kas-yapilacak-aktiviteler` | 1200-1800 kelime |
| Kaş merkez gezilecek yerler | `/kas-merkez-gezilecek-yerler` | 800-1200 kelime |
| Kaş nerede ne yenir | `/kas-nerede-ne-yenir` | 1000-1400 kelime |
| Kaş tatil rehberi | `/kas-tatil-rehberi` | 1500-2000 kelime (pillar content) |
| Kaş koyları listesi | `/kas-koylari` | 1000-1400 kelime |
| Kaş en güzel plajlar | `/kas-en-guzel-plajlar` | 1000-1400 kelime |

- [ ] **Her sayfa için uygulanacak çerçeve:**
  - Benzersiz `<title>` (60 karakter altı, hedef kelime ile başlasın)
  - Benzersiz `<meta description>` (150-160 karakter)
  - Tek `<h1>` (hedef kelime içermeli)
  - En az 3-5 adet `<h2>` alt başlık
  - İlk 100 kelime içinde hedef kelime **doğal** şekilde geçsin
  - En az 1 adet iç link ana sayfaya, 2-3 adet ilgili alt sayfalara
  - 3-5 adet görsel (her birinde açıklayıcı `alt` metni)

### TODO-2.2 · Ana Sayfaya "Özet Bölümleri" Ekle

Alt sayfalar oluşturulsa bile ana sayfada bu konulara kısa değinmek, anchor text ile iç link beslemesi sağlar.

- [ ] Ana sayfaya şu bölümleri ekle (her biri 100-150 kelime + "Detay" linki):
  - [ ] Kaş tekne turu özeti
  - [ ] Kaş dalış noktaları özeti
  - [ ] Kaş otel önerileri özeti
  - [ ] Kaş gece hayatı özeti
  - [ ] Kaş koyları kısa listesi

### TODO-2.3 · Mevcut İçeriğin Anahtar Kelime Yoğunluğunu Artır

- [ ] "Kaş en iyi restoranlar" → Mevcut restoranlar bölüm başlığını `<h2>Kaş'ta En İyi Restoranlar</h2>` olarak değiştir.
- [ ] "Kaş plaj önerileri" → Plaj bölümü başlığını `<h2>Kaş Plaj Önerileri</h2>` olarak yeniden adlandır.
- [ ] "Kaş günlük gezi planı" → Gezi planı bölüm başlığını `<h2>Kaş Günlük Gezi Planı (1-3 Gün)</h2>` yap.

---

## ⚙️ FAZ 3 – TEKNİK İYİLEŞTİRMELER (İlk Ay)

### TODO-3.1 · BreadcrumbList Schema Ekle

Her alt sayfaya ekle. Ana sayfa için örnek:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Ana Sayfa",
      "item": "https://www.kasguide.de/"
    }
  ]
}
</script>
```

Alt sayfa örneği (Kaş Tekne Turu):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://www.kasguide.de/" },
    { "@type": "ListItem", "position": 2, "name": "Kaş Tekne Turu", "item": "https://www.kasguide.de/kas-tekne-turu" }
  ]
}
</script>
```

### TODO-3.2 · WebPage Schema Ekle

- [ ] Mevcut olan `WebSite` schema'sına ek olarak her sayfaya `WebPage` schema'sı ekle.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Kaş Gezi Rehberi",
  "description": "Kaş'ta gezilecek yerler, restoranlar, plajlar ve yerel öneriler.",
  "url": "https://www.kasguide.de/",
  "inLanguage": "tr-TR",
  "isPartOf": { "@type": "WebSite", "url": "https://www.kasguide.de/" }
}
</script>
```

### TODO-3.3 · Görsellere width/height Öznitelikleri Ekle

- [ ] "Haberler" bölümündeki tüm `<img>` etiketlerine `width` ve `height` ekle.
- [ ] **Neden:** Core Web Vitals'ta CLS (Cumulative Layout Shift) skorunu iyileştirir.
- [ ] **Örnek:**

```html
<!-- ÖNCE -->
<img src="/images/haber1.jpg" alt="Kaş haberi">

<!-- SONRA -->
<img src="/images/haber1.jpg" alt="Kaş haberi" width="600" height="400" loading="lazy">
```

- [ ] Bütün görsellere **loading="lazy"** eklenmesi hız için faydalıdır (hero görseli hariç).

### TODO-3.4 · Anchor Text'leri Zenginleştir

- [ ] Hero bölümündeki butonlar:
  - `"Tatilimi planla!"` → `"Kaş Tatilini Planla"`
  - `"Ben Yerlisiyim!"` → `"Kaş Yerel Rehberi Ol"` veya `"Kaş Yerli Rehber Başvurusu"`
- [ ] CTA'lar SEO değeri yüksek metinlerle güncellenmeli.

### TODO-3.5 · İç Link Yapısını Güçlendir

Mevcut iç linkler çoğunlukla navigasyon menüsü tekrarı (`/`, `/biz-kimiz`, `/iletisim` vb.). Alt sayfalar açıldıkça **kontekstüel iç link** stratejisi uygulanmalı:

- [ ] Her yeni alt sayfadan ilgili diğer alt sayfalara anchor text'li link ver.
- [ ] Örnek: "Kaş tekne turu" sayfasından "Kaş koyları listesi" sayfasına → anchor text: *"Turda uğrayacağınız Kaş koyları listesi"*
- [ ] Minimum her sayfada 3-5 adet anlamlı iç link.

---

## 🔗 FAZ 4 – AUTHORITY BUILDING (İlk 3 Ay)

### TODO-4.1 · Dış Link Çeşitliliği

Mevcut backlink'ler sadece WhatsApp ve Facebook'a. Bu bir **otorite problemi**.

- [ ] Google Business Profile açılmalı ve siteye linklenmeli.
- [ ] Instagram profil linki eklenmeli.
- [ ] Yerel turizm sitelerinden (TripAdvisor, GeziForum vb.) bahsedilme ve link alınması hedeflenmeli.
- [ ] Kaş ile ilgili resmi kaynaklara (belediye, turizm müdürlüğü) outbound link verilmesi E-E-A-T (Expertise, Experience, Authoritativeness, Trust) sinyali verir.

### TODO-4.2 · FAQPage Schema'yı Genişlet

Rapor `FAQPage` schema'sının var olduğunu gösteriyor – güzel. Ancak SSS'lere hedef anahtar kelimeleri içeren sorular eklenmeli:

- [ ] "Kaş'ta tekne turu ne kadar sürer?"
- [ ] "Kaş'ta dalış noktaları nerelerdir?"
- [ ] "Kaş'ta nerede ne yenir?"
- [ ] "Kaş'ta günlük gezi planı nasıl yapılır?"
- [ ] "Kaş en güzel plajlar hangileri?"

### TODO-4.3 · Blog/Haberler Bölümünü Aktifleştir

- [ ] Haftada 1 yazı hedefi (ilk 3 ay).
- [ ] İçerik takvimi önerisi:
  - Hafta 1: "Kaş'ta Ağustos'ta Yapılacak 10 Aktivite"
  - Hafta 2: "Kaş Tekne Turu Fiyatları ve Rotalar 2026"
  - Hafta 3: "Kaş'ta Sunset İçin En İyi 5 Nokta"
  - Hafta 4: "Kaş vs. Kalkan: Hangisi Size Uygun?"

---

## 📊 İzlenmesi Gereken Metrikler

Uygulama sonrası 30/60/90 günde ölçülecek:

| Metrik | Araç | Hedef (90 gün) |
|---|---|---|
| Toplam Spindora Skoru | Spindora | 33 → 75+ |
| Kritik Sorun Sayısı | Spindora | 33 → 0 |
| Organic Traffic | Google Analytics 4 | %200+ artış |
| Indexed Pages | Google Search Console | Mevcut + 10 yeni |
| Core Web Vitals (CLS) | PageSpeed Insights | < 0.1 |
| Ortalama Kelime Sayısı/Sayfa | Manuel | 1.215 → 1.500+ |
| Backlink Sayısı | Ahrefs / Ubersuggest | Mevcut + 15 kaliteli |

---

## ✅ Hızlı Başlangıç Kontrol Listesi

Zamanı kısıtlı olanlar için **bugün yapılabilecek 5 aksiyon**:

- [ ] 1. Title'ı güncelle: `Kaş Gezi Rehberi | Gezilecek Yerler ve Tatil İpuçları`
- [ ] 2. Meta description'ı 160 karakter olacak şekilde yeniden yaz.
- [ ] 3. İkinci H1 etiketini H2'ye dönüştür.
- [ ] 4. 6 kırık linki tespit edip düzelt.
- [ ] 5. Hero butonlarının metinlerini SEO dostu yap.

Bu 5 madde sadece birkaç satır HTML değişikliğiyle **Spindora skorunu en az 15-20 puan** yükseltmelidir.

---

## 📎 Referans – Raporda Tespit Edilen Mevcut Varlıklar

**Teknik Metrikler:**
- Kelime Sayısı: 1.215
- H1 Sayısı: 2 (olması gereken: 1)
- İç Link: 37
- Dış Link: 11
- Toplam Görsel: 9 (ALT eksik: 0 ✅)
- Bulunan Schema: 10
- Kırık Link: 6 ❌

**Mevcut Schema Türleri:** Answer, CollectionPage, EntryPoint, FAQPage, ItemList, ListItem, Organization, Question, SearchAction, WebSite
**Eksik Schema Türleri:** BreadcrumbList, WebPage

---

*Döküman hazırlanma tarihi: 21.04.2026 – Kaynak: Spindora SEO Analiz Raporu (Analiz ID: 1bcb6c44)*
