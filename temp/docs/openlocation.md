# OpenLocation / Overpass Sweep Kullanımı

Bu doküman, Kaş Guide içinde `overpass-api.de` üzerinden mekan çekmek için eklenen yeni sweep akışını anlatır.

## Amaç

Google grid sweep mantığının bir ikizi oluşturuldu.
Yeni akış:

- `overpass-api.de` üzerinden veri çeker
- sonucu doğrudan `public.places` tablosuna yazar
- kayıtları `is_sweeped = true` ve `intake_channel = 'sweep'` olarak işaretler
- `grid_sweeps` ve `grid_sweep_cells` içine oturum kaydı düşer
- `/admin/sweeps` ekranında görünür

## Eklenenler

Kod tarafında eklenen ana parçalar:

- `scripts/import-overpass-grid.ts`
- `src/app/api/admin/sweeps/overpass/route.ts`
- `/admin/sweeps` içinde Overpass tetikleme paneli
- `package.json` içine yeni komut:
  - `npm run import:overpass:grid`

## Admin Panelden Kullanım

Yeni kullanım yeri:

- `/admin/sweeps`

Bu ekranda artık bir `Overpass sweep baslat` paneli var.

Girilecek alanlar:

- `Grid X`
- `Grid Y`
- `Hucre boyutu (m)`
- `Bolge adi`
- `Dry-run calistir, veri yazma`

### Normal kullanım

1. Admin panelde `/admin/sweeps` sayfasına gir.
2. `Grid X` ve `Grid Y` değerlerini yaz.
3. Gerekirse hücre boyutunu değiştir. Varsayılan `500`.
4. İstersen bölge adını düzenle.
5. `Overpass sweep baslat` butonuna bas.

Sonuç:

- sweep çalışır
- sonuçlar `places` tablosuna yazılır
- sweep oturumu üst listedeki `Sweep oturumlari` bölümüne düşer
- bulunan mekanlar `Sweep kaynakli mekanlar` listesinde görünür

### Güvenli test

Önce `Dry-run` ile denemen önerilir.

Dry-run ne yapar:

- Overpass sorgusunu çalıştırır
- veriyi hazırlar
- ama `places` tablosuna yazmaz
- yine de sonucu status mesajında görürsün

## Grid Mantığı

Bu script Google grid mantığıyla uyumludur.

Kullandığı alanlar:

- `grid_x`
- `grid_y`
- `gridKey` formatı: `X1Y1`
- `cellId` formatı: `kas-overpass-grid-x1-y1`

Varsayılan merkez:

- lat: `36.199383`
- lng: `29.641333`

Varsayılan hücre boyutu:

- `500m`

Bu yüzden `X1Y1` merkez hücre kabul edilir.
Sağa gittikçe `X` artar, yukarı gittikçe `Y` artar.

## CLI ile Kullanım

Admin panel dışında terminalden de çalıştırabilirsin.

### Dry-run

```bash
npm run import:overpass:grid -- --grid-key=X1Y1 --dry-run
```

### Doğrudan sweep

```bash
npm run import:overpass:grid -- --grid-key=X1Y1
```

### X/Y ile sweep

```bash
npm run import:overpass:grid -- --grid-x=2 --grid-y=3
```

### Özel hücre boyutu

```bash
npm run import:overpass:grid -- --grid-x=2 --grid-y=3 --cell-size-meters=750
```

### Özel bölge adı

```bash
npm run import:overpass:grid -- --grid-x=1 --grid-y=1 --region=Kas%20Merkez%20Overpass
```

## Veritabanına Ne Yazılıyor

Yeni sweep kayıtları `public.places` içine şu mantıkla yazılır:

- `status = 'pending'`
- `verification_status = 'pending'`
- `intake_channel = 'sweep'`
- `is_sweeped = true`
- `primary_source_name = 'osm_overpass'`
- `primary_source_id = 'node/123'` veya `way/456` gibi

Ek olarak:

- `grid_key`
- `cell_id`
- `source_sweep_id`
- `raw_snapshot.osm`

alanları da doldurulur.

## Hangi Kayıtlar Çekiliyor

Sorgu şu tip mekanları hedefliyor:

- restoran
- cafe
- bar / pub
- kahvaltı sinyali taşıyan yerler
- otel / guest house / hostel / apartment
- attraction / museum / gallery
- beach
- marina / park / sports centre / water park
- scuba diving ile ilişkili yerler

Son kategori kararı repo içindeki `detectCategory(...)` mantığıyla verilir.

## Sweep Sonrası Akış

Sweep bittikten sonra:

1. kayıtlar `Sweep kaynakli mekanlar` listesinde görünür
2. admin isterse bu kayıtları açar
3. içerik düzenler
4. `Taslagi kaydet`, `Onayla ve yayinla` veya `Reddet` işlemlerini yapar

Yani Overpass sadece veri toplar.
Yayın kararı yine admin panelinden verilir.

## Önerilen Kullanım Sırası

En güvenli pratik akış:

1. önce `Dry-run`
2. sonuç mantıklıysa aynı hücreyi gerçek sweep ile çalıştır
3. `/admin/sweeps` içinde kayıtları kontrol et
4. gerekli mekanları düzenle
5. sonra yayınla

## Notlar

- Script aynı `primary_source_name + primary_source_id` ile `upsert` çalışır
- yani aynı OSM öğesi tekrar gelirse duplicate yerine update olur
- sweep logları `grid_sweeps` ve `grid_sweep_cells` içinde tutulur
- mekanların kendisi yine tek tablo olan `places` içinde kalır
