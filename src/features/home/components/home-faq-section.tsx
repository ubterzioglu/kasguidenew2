const HOME_FAQ_ITEMS = [
  {
    question: "Kaş'ta kaç gün kalınır?",
    answer:
      "Kaş'ı rahatça keşfetmek için en az 3 gece kalmanızı öneririz. 3 gün boyunca merkezi, plajları, bir tekne turu ve en az bir dalış deneyimi sığdırabilirsiniz. 5–7 gece kalırsanız Patara, Kekova, Likya Yolu etapları ve Çukurbağ yarımadasını da keşfetme fırsatı bulursunuz.",
  },
  {
    question: "Kaş'ta ilk kez gelenler için en iyi bölge hangisi?",
    answer:
      "İlk kez gelenler için Kaş merkezi en pratik seçimdir. Restoranlar, barlar, marina, Çarşı ve minibüs duraklarına yürüyerek ulaşabilirsiniz. Daha sakin bir tatil istiyorsanız Çukurbağ yarımadası merkezden sadece 10–15 dakika uzaklıkta olup muhteşem manzaralar sunar.",
  },
  {
    question: "Kaş'ta en iyi plajlar hangileri?",
    answer:
      "Kaputaş plajı dramatik falezleriyle en fotojenik plajdır. Büyük Çakıl aileler için ideal, sığ ve rahattır. Küçük Çakıl merkeze en yakın seçenektir. Akçagerme ve Limanağzı ise tekne ile ulaşılan, daha sakin alternatiflerdir. Her plajın farklı bir karakteri vardır; detaylı karşılaştırma için plajlar rehberimize göz atabilirsiniz.",
  },
  {
    question: "Kaş'ta nerede kahvaltı yapılır?",
    answer:
      "Kaş'ta serpme kahvaltı geleneği çok güçlüdür. Merkezdeki kahvaltı mekanları deniz manzaralı serpme sofralarıyla ünlüdür. Çukurbağ yarımadasındaki butik oteller de konuk kahvaltısıyla öne çıkar. Kahvaltı mekanları kategorimizde tüm seçenekleri filtreleyip karşılaştırabilirsiniz.",
  },
  {
    question: "Kaş'ta dalış için en uygun dönem ne zaman?",
    answer:
      "Kaş'ta dalış sezonu mayıs ortasından kasım başına kadar sürer. En iyi su sıcaklığı ve görüş mesafesi temmuz–ekim arası elde edilir. Eylül ve ekim ayları su sıcaklığının hâlâ yüksek, kalabalığın ise azaldığı ideal dalış dönemleridir. Kış aylarında da dalış yapılabilmektedir ancak su sıcaklığı düşer.",
  },
  {
    question: "Kaş bütçe dostu bir destinasyon mu?",
    answer:
      "Evet, Kaş her bütçeye uygun seçenekler sunar. Merkezdeki pansiyonlar ve butik oteller uygun fiyatlarla konaklama imkânı sağlarken, sokak aralarındaki lokantalar ve meyhane tarzı mekanlar bütçe dostu yeme-içme deneyimleri sunar. Plajlar genellikle ücretsizdir ve yürüyerek keşfedilebilen kompakt yapısı sayesinde ulaşım masrafı minimumda tutulabilir.",
  },
] as const

export function HomeFaqSection() {
  return (
    <section className="container page-shell" aria-label="Sık sorulan sorular">
      <h2>Kaş Hakkında Sık Sorulan Sorular</h2>
      {HOME_FAQ_ITEMS.map((item, index) => (
        <details key={index} style={{ marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1.05rem' }}>
            <span style={{ display: 'inline' }}>{item.question}</span>
          </summary>
          <p style={{ marginTop: '0.5rem', lineHeight: 1.7 }}>{item.answer}</p>
        </details>
      ))}
    </section>
  )
}

export { HOME_FAQ_ITEMS }
