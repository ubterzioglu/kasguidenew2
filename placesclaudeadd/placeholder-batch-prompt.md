# Deep-Research Prompt: Kaş Placeholder Mekan Batch

ChatGPT / Claude / Gemini / Perplexity gibi bir LLM'e yapıştırılacak prompt. Amaç: Kaş'ta gerçek mekanları bulup `placeholder-batch.sql` içindeki `input` CTE'sine eklenmek üzere **sadece** SQL `VALUES` satırları ürettirmek.

---

## Kullanım

1. Aşağıdaki **Prompt Şablonu**'nu kopyala.
2. `{KATEGORI}` ve `{N}` placeholder'larını kendi isteğine göre doldur.
3. LLM'e ver.
4. Dönen `VALUES (...)` satırlarını `placesclaudeadd/placeholder-batch.sql` içindeki `input` CTE'sine yapıştır.
5. Supabase SQL editor → Run.

---

## Prompt Şablonu (tek kategori, N mekan)

```
Sen Kaş (Antalya, Türkiye) bölgesi uzmanı bir yerel rehber ve veri araştırmacısısın.
Görevin: Kaş'ta gerçekten var olan, açık durumdaki {KATEGORI} kategorisindeki
mekanlardan {N} adet bul ve aşağıdaki tam SQL formatında üret.

ARAŞTIRMA KAYNAKLARI (önerilen, açık web):
- Google Maps (kaş + {KATEGORI})
- TripAdvisor Kaş listeleri
- Yerel Türkçe gezi blogları (ntv, milliyet, sabah gezi, kaşgezi, kasguide.de rakipleri)
- Instagram konum etiketleri (#kaş, #kaskafe, #kasrestaurant vs.)

FORMAT — çıktı SADECE SQL VALUES listesi olsun, başka hiçbir metin yazma:

    ('slug-1',  'Mekan Adı 1',   '{KATEGORI}', 'recommend'),
    ('slug-2',  'Mekan Adı 2',   '{KATEGORI}', 'must-see'),
    ...
    ('slug-N',  'Mekan Adı N',   '{KATEGORI}', 'hidden-gem')

KURALLAR:
1. slug kuralları:
   - lowercase
   - Türkçe karakter yok (ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c)
   - Boşluk yerine `-`
   - Noktalama, apostrof yok
   - Başka şehirlerle karışabilecek adlarda `-kas` son eki kullan
   - Örnek: "Bahçe Restaurant" → `bahce-restaurant-kas`
2. name: mekanın resmi veya yaygın bilinen adı (Türkçe karakter OK).
3. category_primary: her satırda TAM OLARAK `{KATEGORI}` olacak (sabit).
4. badge kuralları (şu 4'ten biri):
   - `must-see`      → çok ünlü, herkesin gitmesi beklenen
   - `recommend`     → kaliteli ama ünlü değil, genel öneri
   - `hidden-gem`    → niş, az bilinen ama iyi
   - `local-favorite`→ yerellerin tercih ettiği, turist odaklı değil
5. Kapalı, taşınmış, tartışmalı, şüpheli mekan EKLEME.
6. Zincir markaları (Starbucks, Hilton, vb.) EKLEME — butik / yerel odaklı.
7. Tekrar eden mekan EKLEME; her slug benzersiz olmalı.
8. Son satır virgülle bitmesin; diğerleri virgülle bitsin.
9. Her satır ayrı bir satırda olsun, sütunlar boşluklarla hizalı.

ÇIKTI — sadece aşağıdaki gibi, başka hiçbir şey:

    ('bahce-restaurant-kas',  'Bahçe Restaurant',  'restoran',  'recommend'),
    ('merkez-lokantasi-kas',  'Merkez Lokantası',  'restoran',  'local-favorite'),
    ...
```

---

## Prompt Şablonu (çoklu kategori, her biri N mekan)

Aynı prompt ama `{KATEGORI}` yerine liste:

```
Sen Kaş uzmanı veri araştırmacısısın. Aşağıdaki kategoriler için her birinden
{N} adet Kaş mekanı bul:

KATEGORI LISTESI:
- restoran     ({N} adet)
- cafe         ({N} adet)
- bar          ({N} adet)
- kahvalti     ({N} adet)
- meyhane      ({N} adet)
- plaj         ({N} adet)
- dalis        ({N} adet)
- oteller      ({N} adet, butik/yerel)

[... yukarıdaki Prompt Şablonu'ndaki tüm KURALLAR buraya ...]

Çıktı: TEK bir SQL VALUES listesi, kategoriler karışık sırada olabilir.
```

---

## Örnek Çıktı (beklenen format)

```sql
    ('bahce-restaurant-kas',      'Bahçe Restaurant',       'restoran',  'recommend'),
    ('mandarin-kas',              'Mandarin',               'restoran',  'must-see'),
    ('enishte-ali-kas',           'Enişte Ali',             'restoran',  'local-favorite'),
    ('deniz-restaurant-kas',      'Deniz Restaurant',       'restoran',  'recommend'),
    ('sultan-garden-kas',         'Sultan Garden',          'restoran',  'hidden-gem')
```

---

## Entegrasyon Adımları

1. **Prompt'u çalıştır** → yukarıdaki gibi VALUES satırları al.
2. `placeholder-batch.sql` dosyasını aç.
3. İçindeki `input` CTE'sindeki örnek satırları sil (veya sonlarına virgül koy).
4. LLM çıktısını oraya yapıştır.
5. Supabase Dashboard → SQL Editor → Run.
6. Alt kısımdaki **DOGRULAMA** SELECT'i ile kaç satır eklendiğini gör.
7. Live: `https://www.kasguide.de/mekan/<slug>` (revalidate cache 1 saat olduğundan ilk görüntüleme gecikebilir).

## Hata Senaryoları

| Durum | Sebep | Çözüm |
|-------|-------|-------|
| Satır atlandı, hata vermedi | `WHERE NOT EXISTS` guard tetiklendi; aynı slug zaten var | Normal davranış. Atlanan slug'ı `SELECT name FROM places WHERE slug='...'` ile gör. |
| CHECK constraint hatası | `category_primary` whitelist dışı | SQL'deki `WHERE i.category_primary IN (...)` bloğu bunu önler; LLM prompt'una uymamış demektir. |
| Frontend'te görünmüyor | Next.js cache (revalidate 3600) | 1 saat bekle **veya** `next build` + redeploy. |
| Slug yanlış Türkçe karakter | LLM prompt'u ihlal etmiş | Manuel düzelt: `UPDATE places SET slug='...' WHERE id='...';` |

## Güvenlik

- Placeholder kayıtlar `raw_snapshot.source = 'manual_placeholder'` ile tag'li → toplu rollback kolay:
  ```sql
  DELETE FROM public.places WHERE raw_snapshot->>'source' = 'manual_placeholder';
  ```
- `bigconvert.md` A5.4 uygulandığında bu kayıtlar otomatik `<meta robots="noindex">` alır (long_description < 60 kelime koşulu), yani thin-content Google'a indexlenmeden içerik doldurulmuş olur.
