# Planner Logic

Bu doküman, `/planner` akışının kanonik mantık özetidir. Uygulamadaki ana referans dosya [src/features/planner/components/planner-page-client.tsx](/c:\.temp_private\kasguidenew2\src\features\planner\components\planner-page-client.tsx) ve veri eşlemesi [src/lib/planner-data.ts](/c:\.temp_private\kasguidenew2\src\lib\planner-data.ts) içindedir.

## Soru Tipleri ve Akış Kuralları

- `binary`: iki seçenekli tek seçim sorusu.
- `multiple`: birden fazla seçenek sunan tek seçim sorusu.
- `checkbox`: çok seçimli soru.

Akış kuralları:

- Tek seçimli sorularda kullanıcı bir seçeneğe bastığında cevap state'e yazılır.
- Tek seçimli sorularda, eğer aktif soru son soru değilse planner otomatik olarak bir sonraki soruya geçer.
- Tek seçimli son soruda otomatik submit yapılmaz. Kullanıcının sonuç ekranına geçmesi için son CTA'ya basması gerekir.
- `checkbox` sorularında otomatik geçiş yoktur; kullanıcı seçimlerini yapar ve `Sonraki` ile ilerler.
- İlerleme, progress bar ve `Soru x / 25` etiketi üzerinden izlenir.
- Zorunlu cevap kontrolü `isAnswered` ve `validateStep` ile yapılır.

## `answers` State Yapısı

`answers`, soru id'sini cevap değeriyle eşleyen bir nesnedir:

```ts
type Answers = Record<number, number | number[]>
```

- Tek seçimli sorularda değer `number`
- Çok seçimli `checkbox` sorularda değer `number[]`

Örnek:

```ts
{
  2: 3,
  9: [0, 4],
  10: [0, 2]
}
```

## Profil Üretme Mantığı: `buildProfile`

`buildProfile(answers)` kullanıcı cevaplarından planner'ın kullanacağı ara profili üretir.

Üretilen alanlar:

- `tags`: mekan puanlamasında kullanılacak etiket kümesi
- `wants.breakfast | lunch | dinner`: hangi öğünlerin rota içine dahil edileceği
- `budget`: bütçe tercihi
- `group`: grup yapısı
- `alcoholPref`: alkol tercihi
- `energetic`: enerji seviyesi

Mantık:

- Yemek tercihleri, deniz stili ve aktivite cevapları `TAG_MAP` üzerinden etikete çevrilir.
- Alkol tercihi belirli seçeneklerdeyse profile `alcohol` eklenir.
- Aile veya grup ile geliniyorsa `family` ve `group` etiketleri eklenir.
- Fotoğraf tercihi belirli cevapta ise `photo` etiketi eklenir.
- Öğün seçimleri `answers[10]` üzerinden `wants` alanına yazılır.

## Kategori Eşleme: `SLOT_TO_CATEGORIES`

Planner, günün farklı slot'ları için belirli kategori havuzları kullanır:

- `breakfast`: `kahvalti`, `cafe`, `restoran`
- `morningActivity`: `plaj`, `gezi`, `tarih`, `doga`, `dalis`, `aktivite`
- `lunch`: `restoran`, `cafe`
- `afternoon`: `carsi`, `gezi`, `doga`, `tarih`
- `dinner`: `restoran`, `meyhane`
- `night`: `bar`, `cafe`, `meyhane`

Bu eşleme, her zaman slot'un konuya uygun mekan havuzu ile başlamasını sağlar.

## Puanlama Mantığı: `scorePlace`

`scorePlace(place, profile)` her mekan için sayısal skor üretir.

Puan bileşenleri:

- `tagMatch`: profil etiketi ile mekan etiketi eşleşirse artar
- `budgetMatch`: mekan bütçesi ile profil bütçesi yakınsa artar
- `ratingBoost`: rating varsa ek artış verir

Özet mantık:

- Her ortak tag için sabit puan eklenir
- Bütçe tam eşleşirse daha yüksek, bir kademe fark varsa daha düşük puan eklenir
- Rating varsa üst sınırla birlikte ek puan verilir

Bu skor, planner'ın kesin filtre yerine yumuşak tercih optimizasyonu yapmasını sağlar.

## Slot Bazlı Seçim: `pickTopPlacesForSlot`

`pickTopPlacesForSlot(slotKey, profile, places, limit)` akışı:

1. Slot için izinli kategoriler `SLOT_TO_CATEGORIES` içinden alınır.
2. Tüm mekanlar bu kategori listesine göre filtrelenir.
3. Havuz boş değilse o havuz, boşsa tüm mekan listesi fallback olarak kullanılır.
4. Her mekan `scorePlace` ile puanlanır.
5. Skora göre azalan sırada dizilir.
6. İlk `limit` kadar mekan döndürülür.

Bu yapı sayesinde hem kategori uyumu korunur hem de veri az olduğunda planner bozulmaz.

## Itinerary Üretimi

`buildItinerary(answers)` cevaplardan günlük akış kartlarını üretir.

Karar alanları:

- deniz / tarih / doğa eğilimi
- siesta tercihi
- bar ve dans eğilimi
- et ağırlıklı yemek isteği

Çıktı:

- Sabah başlangıç bloğu
- Sabah aktivitesi bloğu
- Öğle bloğu
- Öğleden sonra bloğu
- Akşam bloğu
- Gece bloğu

Bazı blokların başlık ve açıklamaları cevaplara göre dallanır; örneğin sabah aktivitesi deniz, tarih, doğa veya serbest keşif olabilir.

## Öneri Grupları

`buildRecommendations(profile, places)` öneri listelerini slot mantığına göre kurar.

- Kahvaltı yalnız kullanıcı istediyse eklenir
- Öğle yalnız kullanıcı istediyse eklenir
- Akşam yalnız kullanıcı istediyse eklenir
- Sabah aktivitesi, öğleden sonra ve gece grupları her zaman oluşturulur
- Boş grup varsa sonuçtan çıkarılır

## Fallback Davranışları

- Slot kategorisinde mekan bulunamazsa tüm yayınlanmış planner mekanları fallback havuzu olur.
- Mekan verisi yetersizse sonuç ekranı yine itinerary üretir.
- Öneri grubu boşsa sonuç ekranında fallback bilgi kartı gösterilir.
- Planner veri modeli, kartların bilgi sinyali gösterebilmesi için `address`, `phone`, `website` ve `badges` alanlarını taşır.

## Tek Seçim Auto-Advance Kuralı

Bu davranış kullanıcı akışının önemli bir parçasıdır:

- Soru tipi `checkbox` değilse ve aktif soru son soru değilse, seçim sonrası otomatik ilerlenir.
- Soru tipi `checkbox` ise otomatik ilerleme yapılmaz.
- Aktif soru son soruysa, tek seçim bile olsa otomatik submit yapılmaz.

Bu sayede planner hem hızlı akar hem de son ekranda kullanıcı kontrolü korunur.
