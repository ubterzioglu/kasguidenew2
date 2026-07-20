import type { ParsedFeedItem } from '@/lib/news-scraper/types'

/**
 * Kas Guide bir turizm/gezi rehberi. Bir haber Kas bolgesiyle ilgili olabilir
 * ama yine de rehber icerigi icin uygun olmayabilir: orman yangini, deprem,
 * asayis olaylari, secim haberleri, nobetci eczane listeleri gibi.
 *
 * Bu modul "Kas ile ilgili mi?" sorusunu DEGIL (onu relevance.ts yapiyor),
 * "tatil planlayan bir ziyaretci icin uygun mu?" sorusunu cevaplar.
 */

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

/**
 * Rehber icerigine uygun olmayan konular.
 *
 * NOT: Turkce sondan eklemeli oldugu icin desenler KOK esleseme yapar
 * ("yangin" -> "yangina", "yanginina", "yanginlari" hepsini yakalar). Bu yuzden
 * cogu desende sondaki \b bilerek yoktur. Ayrica Google News yabanci dilli
 * kaynaklari da getirdigi icin ("Mayoral Candidate", "Élections locales")
 * Ingilizce/Fransizca karsiliklar da eklenmistir.
 */
const EXCLUDED_TOPIC_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'afet/yangin', pattern: /\b(yangin|alev(ler)?|itfaiye|kul oldu|makilik|sondurul|mudahale (baslad|suruyor)|wildfire)/ },
  { label: 'deprem', pattern: /\b(deprem|sarsinti|afad|richter|buyuklugunde|artci|earthquake)/ },
  {
    label: 'asayis/adliyat',
    pattern: /\b(cinayet|gozalt|tutukla|operasyon|kacakcil|uyusturucu|hirsiz|dolandiric|silahli|yarala|olu bulundu|ceset|kaza|carpisma|bogul|feto|fetonun|firar|supheli|jandarma|polis ekipleri|tibbi tahliye)/,
  },
  {
    label: 'secim/siyaset',
    pattern: /\b(secim|aday|oy puslasi|sandik|milletvekili|chp|akp|ak parti|mhp|iyi parti|deva|saadet|zafer partisi|tkp|meclis uyesi|belediye baskan|mayoral candidate|municipal mayor|elections locales|candidats)/,
  },
  { label: 'saglik-nobet', pattern: /\b(nobetci|eczane|hastane|ameliyat|salgin)/ },
  { label: 'icra/ihale/satis', pattern: /\b(icradan|icra ile|ihale|mahkeme|dava|haciz|satisa cikar|iptal edildi)/ },
  { label: 'altyapi-kesinti', pattern: /\b(su kesintisi|elektrik kesintisi|kesinti uygulanacak|ariza)/ },
  { label: 'is-ilani', pattern: /\b(personel al|is ilani|kpss|memur alimi|isci alimi|sozlesmeli personel)/ },
  { label: 'sendika/kriz', pattern: /\b(sendika|grev|aidat kriz|isten cikar)/ },
  { label: 'vefat', pattern: /\b(vefat|hayatini kaybet|cenaze|taziye|olum)/ },
  { label: 'hava-uyari', pattern: /\b(afrika atesi|sicak hava dalgasi|meteoroloji uyar|firtina uyar|saganak|hortum|sel bask)/ },
  { label: 'siyaset-genel', pattern: /\bsiyaset|protesto|eylem yapt|isyan ett/ },
]

export type TopicFilterResult = {
  allowed: boolean
  /** Elendiyse hangi konu yuzunden elendigi (loglama/hata ayiklama icin). */
  excludedBy?: string
}

export function checkTopicSuitability(item: ParsedFeedItem): TopicFilterResult {
  const haystack = normalize(`${item.title} ${item.summary}`)

  for (const { label, pattern } of EXCLUDED_TOPIC_PATTERNS) {
    if (pattern.test(haystack)) {
      return { allowed: false, excludedBy: label }
    }
  }

  return { allowed: true }
}
