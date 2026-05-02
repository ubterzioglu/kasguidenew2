import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFrame } from '@/components/site-frame'
import { HomeJsonLd, buildBreadcrumbListSchema } from '@/features/home/components/home-jsonld'

const BOAT_TOUR_IMAGES = [
  'https://images.openai.com/static-rsc-4/-krA9B_T-VC7Y9ELuCFjaKmNudHcTk23qRSzm7-9BrwcFFlepCXYX213igFbwKdfg6LasoIuqP4BipaBDaLC7XdyM73IoX_-uHhV7pPm4qrcGm96K3-f6J4sW_DwDdXhNxiFF-LBCQh_RcE_7VxNY8Q72aU3qSOZNL8qGUkOi_NLT_Us0aQpO74OipvELAvk?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/YhP_wdXI2Z9d29LGWHn783ovwYvFmmBE3B48nt4DtUS8C8ZHCQq77QDqUe0lzi1krsb_UV8GwxCfNri5Zl1408UJgHD-BtE_4kZs16z0kpC8lP9SNFFf-t5D6diP75FSuSsAVBjiMkdrU17hinFvMC1xSahymdW1dLvC3-Ia47E4hptVQxlqTyrtEdIC3DeT?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/nG8f__U0Yj-9tB-uQDYgue3d6tyY1BDcOHf90B12JymgeryzppOhl-trdoEsJfzZSunBCQQX4Yl_UOYb1sgHn7vI41PzSeK7rVSBbFtJamxBdip80mOO_jn1Tfm684FUP1TGSbEkxCexGD9SlSZ-evbw6FWodXf8q2wKwLvGF4N6NvBQJ7SmehMSUGoF3SAf?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/pIkp46vsSWTxAqO6Vem8yQpl42yIZ1Cmx-s9zo2Mjdhsu1Ro2ZVTz4tbZoWfh3l_xwuXG-vSw1g5xMM9XWD4oIMg43mossoF2vd9kST36awhnvlW5exI5P9UL5r2pIe8hXZ9vQnM5WSnQAwIve4Jecr-Cxr7OWMYGTs7VtQq63bWbE3uSwgP01gizs_QTYtq?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/h40-5D8s5vhbV2xhJ1wb0_khhlUqBlAYPk_7-dgBQzfRsUTcS7RweXUEVolPuIMf4QfQ9e0K1Tkk7iPzumhG0KZPmjX2PPll1Z2R2XcT2UwUueBupnhnpaTor_yPhVRuYav8W-Vo2EtpOWqQv4QJ9BvzDntw4iBKocrT52wgvoteMeqEllxJwVIMOI4dSWuz?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/-W_Hq0_IFi7bXydxG3P9hA2mDiSzq1jfnQ8slq9lGj1gjAKUXa122_BPdiT5-eYjY5JCs6Ha65yYnyO_jiQkL182Zk2VgsRM8V5uPpdvoqcrWDtVrwL_R8epLdMwbQ99VFSEPHTPr3KkA2R-mnmLs43hCWuoDKe-o-_-eyf95KFXoMcFMF6Nwagqa4vP7VRg?purpose=fullsize',
] as const

export const metadata: Metadata = {
  title: 'Kaş Tekne Turları: Akdeniz’in En Saf Haliyle Buluşma Deneyimi',
  description:
    'Kaş tekne turları rehberi: Kekova, Batık Şehir, Akvaryum Koyu, Limanağzı, özel ve günlük turlar, deneyim akışı ve sezon bilgileri.',
  alternates: { canonical: '/kas-tekne-turu' },
  openGraph: {
    url: '/kas-tekne-turu',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaş Guide',
  },
}

export default async function KasTekneTuruPage() {
  return (
    <SiteFrame>
      <main className="kas-tekne-turu-page">
        <section className="page-hero kas-tekne-hero">
          <h1>Kaş Tekne Turları: Akdeniz&apos;in En Saf Haliyle Buluşma Deneyimi</h1>
          <p>
            Kaş tekne turları, Türkiye&apos;nin en özel deniz deneyimlerinden biri olarak kabul edilir. Akdeniz&apos;in
            berrak sularında, kalabalıktan uzak koylarda yüzmek, tarihi kalıntıları denizden keşfetmek ve doğayla iç içe
            bir gün geçirmek isteyenler için bu turlar vazgeçilmezdir.
          </p>
        </section>

        <section className="page-content">
          <div className="article-image-stack">
            {BOAT_TOUR_IMAGES.map((imageUrl, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={imageUrl} src={imageUrl} alt={`Kaş tekne turları görseli ${index + 1}`} className="article-inline-image" loading="lazy" />
            ))}
          </div>

          <p>
            Kaş tekne turları, Türkiye&apos;nin en özel deniz deneyimlerinden biri olarak kabul edilir. Akdeniz&apos;in
            berrak sularında, kalabalıktan uzak koylarda yüzmek, tarihi kalıntıları denizden keşfetmek ve doğayla iç içe
            bir gün geçirmek isteyenler için bu turlar vazgeçilmezdir. Kaş&apos;ın coğrafi yapısı sayesinde kara yolu ile
            ulaşılması zor olan birçok koy ve ada, yalnızca teknelerle keşfedilebilir ve bu da deneyimi eşsiz kılar.
          </p>

          <h2>Kaş Tekne Turu Nedir?</h2>
          <p>
            Kaş tekne turları genellikle sabah saatlerinde başlayıp akşamüstüne kadar süren günübirlik deniz gezileridir.
            Bu turlar sırasında farklı koylarda yüzme molaları verilir, teknede yemek servisi yapılır ve gün boyunca
            dinlenme, güneşlenme ve keşif imkanı sunulur. Çoğu tur yaklaşık 7-8 saat sürer ve Kaş limanından hareket eder.
          </p>
          <p>
            Tekne turları yalnızca bir gezi değil, aynı zamanda bir yaşam tarzı deneyimidir. Sabah limandan
            ayrıldığınızda şehir gürültüsünü geride bırakır, gün boyunca sadece denizin sesi ve doğanın huzuru eşlik eder.
          </p>

          <h2>Kaş Tekne Turu Rotaları</h2>
          <p>
            Kaş tekne turlarının en önemli özelliği, rotalarının son derece zengin ve çeşitli olmasıdır. Her tur firması
            farklı güzergahlar sunsa da en popüler duraklar genellikle benzerlik gösterir.
          </p>

          <h3>1. Kekova ve Batık Şehir</h3>
          <p>
            Kekova bölgesi, Kaş tekne turlarının en ikonik rotasıdır. Bu bölgede deniz altında kalan antik şehir
            kalıntıları, Likya döneminden izler taşır. Batık Şehir üzerinde yüzmek yasaktır ancak tekneyle üzerinden
            geçerek bu tarihi yapıları gözlemlemek mümkündür.
          </p>

          <h3>2. Akvaryum Koyu</h3>
          <p>
            Adını berraklığından alan bu koy, şnorkelle yüzmek için en ideal yerlerden biridir. Su o kadar temizdir ki
            deniz canlılarını net şekilde görmek mümkündür.
          </p>

          <h3>3. Limanağzı Koyları</h3>
          <p>
            Kaş merkezinin karşısında yer alan bu koylar, sakin ve korunaklı yapısıyla özellikle yüzme molaları için
            tercih edilir.
          </p>

          <h3>4. Ufakdere ve Hidayet Koyu</h3>
          <p>
            Daha az bilinen ama doğallığını koruyan bu bölgeler, kalabalıktan uzaklaşmak isteyenler için idealdir.
          </p>

          <h3>5. Meis Adası (Opsiyonel)</h3>
          <p>
            Bazı özel turlarda Yunanistan&apos;a bağlı Meis Adası&apos;na geçiş yapılabilir. Bu rota için pasaport
            gereklidir ve farklı bir kültürel deneyim sunar.
          </p>

          <h2>Tekne Turu Türleri</h2>
          <p>Kaş&apos;ta farklı beklentilere uygun birçok tekne turu seçeneği bulunur:</p>

          <h3>Günlük Tekne Turları</h3>
          <p>
            En yaygın ve ekonomik seçenektir. Grup halinde yapılır ve standart bir rota izlenir. Genellikle yemek ve
            içecek servisi dahildir.
          </p>

          <h3>Özel Tekne Turları</h3>
          <p>
            Tekne tamamen size ayrılır. Rota, yemek ve saatler tamamen sizin tercihinize göre belirlenir. Daha sakin ve
            kişiselleştirilmiş bir deneyim sunar.
          </p>

          <h3>Gün Batımı Turları</h3>
          <p>Kısa süreli (2-3 saat) romantik turlardır. Özellikle çiftler tarafından tercih edilir.</p>

          <h3>Mavi Tur (Konaklamalı)</h3>
          <p>Birden fazla gün süren, teknede konaklamalı turlardır. Daha kapsamlı bir deniz tatili deneyimi sunar.</p>

          <h2>Kaş Tekne Turu Deneyimi Nasıl Geçer?</h2>
          <p>Tipik bir Kaş tekne turu programı şu şekilde ilerler:</p>
          <ul>
            <li>Sabah limandan hareket (09:30 civarı)</li>
            <li>İlk koyda yüzme molası</li>
            <li>Gün içinde 3-5 farklı durakta yüzme ve dinlenme</li>
            <li>Teknede öğle yemeği (balık, tavuk veya vejetaryen seçenekler)</li>
            <li>Öğleden sonra çay, meyve ikramı</li>
            <li>Akşamüstü limana dönüş</li>
          </ul>
          <p>
            Bu süreç boyunca ister güneşlenebilir, ister kitap okuyabilir, ister denizin keyfini çıkarabilirsiniz.
            Tekneler genellikle gölgelik alanlar, duş, tuvalet ve dinlenme alanları gibi imkanlar sunar.
          </p>

          <h2>Fiyatlar ve Sezon</h2>
          <p>Kaş tekne turu fiyatları birçok faktöre göre değişir:</p>
          <ul>
            <li>Tekne tipi (ahşap, yat, motoryat)</li>
            <li>Tur türü (grup / özel)</li>
            <li>Sezon (yüksek sezon yaz ayları)</li>
            <li>Hizmet içeriği (yemek, içecek, ekstra aktiviteler)</li>
          </ul>
          <p>Genel olarak:</p>
          <ul>
            <li>Paylaşımlı turlar kişi başı uygun fiyatlıdır</li>
            <li>Özel turlar daha pahalıdır ancak tamamen kişiye özeldir</li>
            <li>Kekova gibi popüler rotalar daha yüksek fiyatlı olabilir</li>
          </ul>
          <p>Yaz sezonunda yoğunluk yüksek olduğu için erken rezervasyon önerilir.</p>

          <h2>Kaş Tekne Turlarının Öne Çıkan Avantajları</h2>
          <ul>
            <li>Kara yolu ile ulaşılamayan koyları keşfetme fırsatı</li>
            <li>Berrak ve temiz sularda yüzme deneyimi</li>
            <li>Tarih, doğa ve denizin birleşimi</li>
            <li>Sosyal veya tamamen özel seçenekler</li>
            <li>Fotoğraf ve içerik üretimi için eşsiz manzaralar</li>
          </ul>
          <p>
            Kaş, Akdeniz&apos;in en berrak denizlerinden birine sahip olduğu için özellikle su altı gözlemleri ve şnorkel
            için oldukça uygundur.
          </p>

          <h2>Sonuç</h2>
          <p>
            Kaş tekne turları, klasik bir tatil aktivitesinden çok daha fazlasını sunar. Bu deneyim; doğayla bağ kurmak,
            tarihi keşfetmek ve zihinsel olarak dinlenmek için eşsiz bir fırsattır. İster tek başına ister arkadaş
            grubuyla, ister romantik bir kaçamak için olsun, Kaş&apos;ta denize açılmak her zaman unutulmaz bir anıya
            dönüşür.
          </p>
          <p>
            Kaş&apos;a gidip tekne turuna çıkmamak, bu bölgenin en önemli deneyimlerinden birini kaçırmak anlamına gelir.
          </p>
        </section>

        <section className="page-internal-links">
          <h2>Daha Fazla Keşif</h2>
          <p>
            <Link href="/">Ana Sayfaya Dön</Link> | <Link href="/kas-koylari">Kaş Koyları Listesi</Link> |{' '}
            <Link href="/kas-dalis-noktalari">Dalış Noktaları</Link>
          </p>
        </section>

        <HomeJsonLd />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBreadcrumbListSchema('Kaş Tekne Turu', 'https://www.kasguide.de/kas-tekne-turu')),
          }}
        />
      </main>
    </SiteFrame>
  )
}
