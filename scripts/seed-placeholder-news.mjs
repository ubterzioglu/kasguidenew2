import fs from 'node:fs'

import pg from 'pg'

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('POSTGRES_URL veya DATABASE_URL bulunamadi.')
}

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function query(text, params = []) {
  const client = await pool.connect()

  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

const migrationSql = fs.readFileSync(
  new URL('../supabase/migrations/20260411150000_create_news_and_announcements.sql', import.meta.url),
  'utf8',
)

const now = Date.now()

const placeholderNews = [
  {
    title: 'Kaş Rehberi İçin Yeni Sezon Hazırlıkları',
    slug: 'placeholder-haber-1-yeni-sezon-hazirliklari',
    summary: 'Kaş Guide üzerinde yaz sezonu öncesi yapılacak güncellemeler için örnek placeholder içerik.',
    content:
      'Bu haber kartı placeholder olarak eklendi.\n\nGerçek içerik hazır olduğunda başlık, özet ve detay metni admin panelinden güncellenebilir.',
    publishedAt: new Date(now - 1 * 86400000).toISOString(),
    sortOrder: 1,
  },
  {
    title: 'Yeni Mekan İncelemeleri Çok Yakında',
    slug: 'placeholder-haber-2-yeni-mekan-incelemeleri',
    summary: 'Kaş içindeki yeni mekanlar için hazırlanmış örnek haber girdisi.',
    content:
      'Bu içerik geçici olarak görünüm testi için eklendi.\n\nİleride gerçek duyuru veya haber metni ile değiştirilebilir.',
    publishedAt: new Date(now - 2 * 86400000).toISOString(),
    sortOrder: 2,
  },
  {
    title: 'Kaş Guide Mobil Deneyimi Geliştiriliyor',
    slug: 'placeholder-haber-3-mobil-deneyim',
    summary: 'Mobil kullanıcı deneyimi iyileştirmeleri için örnek placeholder haber.',
    content:
      'Bu haber, yeni carousel ve liste ekranlarını test etmek amacıyla oluşturuldu.\n\nCanlı içerikle sonradan değiştirilebilir.',
    publishedAt: new Date(now - 3 * 86400000).toISOString(),
    sortOrder: 3,
  },
  {
    title: 'Yaklaşan İçerik Serileri İçin Taslak Duyuru',
    slug: 'placeholder-haber-4-icerik-serileri',
    summary: 'Yeni içerik kategorileri ve editoryal akış için test amaçlı haber girdisi.',
    content:
      'Sistemdeki haber listeleme ve detay sayfaları bu placeholder veri ile test ediliyor.\n\nİçerik gerektiğinde tamamen değiştirilebilir.',
    publishedAt: new Date(now - 4 * 86400000).toISOString(),
    sortOrder: 4,
  },
  {
    title: 'Admin Paneli İçerik Yönetimi Test Kaydı',
    slug: 'placeholder-haber-5-admin-panel-test',
    summary: 'Admin panelindeki haber düzenleme akışını görmek için eklenen örnek kayıt.',
    content:
      'Bu kayıt placeholder amaçlı eklendi.\n\nİstersen bu kaydı admin panelinden düzenleyebilir, yayından kaldırabilir veya silebilirsin.',
    publishedAt: new Date(now - 5 * 86400000).toISOString(),
    sortOrder: 5,
  },
]

await query(migrationSql)

for (const item of placeholderNews) {
  await query(
    `insert into public.news (title, slug, summary, content, image_url, published_at, is_active, sort_order, status)
     values ($1, $2, $3, $4, null, $5, true, $6, 'published')
     on conflict (slug) do update
       set title = excluded.title,
           summary = excluded.summary,
           content = excluded.content,
           image_url = excluded.image_url,
           published_at = excluded.published_at,
           is_active = excluded.is_active,
           sort_order = excluded.sort_order,
           status = excluded.status,
           updated_at = timezone('utc', now())`,
    [item.title, item.slug, item.summary, item.content, item.publishedAt, item.sortOrder],
  )
}

const result = await query(
  `select title, slug, status, sort_order
   from public.news
   where slug like 'placeholder-haber-%'
   order by sort_order asc`,
)

console.log(JSON.stringify(result.rows, null, 2))

await pool.end()