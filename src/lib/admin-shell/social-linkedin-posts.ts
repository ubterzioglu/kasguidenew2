// LinkedIn Paylaşım Deposu — Kaş Guide (statik tek kaynak, admin-updates.ts ile aynı felsefe).
// /admin/(dashboard)/social sayfası bu listeden beslenir. Her kalem için:
//  - 2 metinsiz İngilizce ChatGPT/AI görsel üretim promptu (kare 1:1, no-text kuralları
//    promptun içine gömülü — kullanıcı bu promptu istediği görsel motoruna yapıştırır),
//  - 1 kopyala-yapıştır Türkçe LinkedIn postu.
// Görseller BU repoda üretilmez (image-gen API/anahtarı yok); yalnızca prompt üretilir,
// gerçek görsel üretimi admin panelinden manuel yapılır (ChatGPT/Midjourney/vb.).
//
// İçerik kaynağı gerçek platform özellikleridir (bkz. src/lib/categories.ts,
// src/app/planner, src/app/arama, src/lib/updates-store.ts, src/lib/place-scraper,
// src/lib/news-scraper) — uydurma özellik eklenmemiştir.
//
// İçerik düzenlemesi BU dosyadan yapılır. Metinler temiz UTF-8 Türkçe + gerçek tırnak +
// emoji olarak tutulur; HTML-entity veya mojibake KULLANILMAZ. Yeni post eklerken `id`
// ve `order` benzersiz olmalı.

export type SocialPostCategory =
  | 'kategori'
  | 'ozellik'
  | 'sayfa'
  | 'marka'

export const SOCIAL_POST_CATEGORY_LABELS: Record<SocialPostCategory, string> = {
  kategori: 'Kategori Tanıtımı',
  ozellik: 'Platform Özelliği',
  sayfa: 'Rehber Sayfası',
  marka: 'Marka / Topluluk',
}

export type SocialLinkedinPost = {
  /** Benzersiz kimlik (kebab-case, "post-1" ... "post-50"). */
  id: string
  /** Görünüm sırası (1..50). */
  order: number
  category: SocialPostCategory
  /** Post başlığı (admin listesinde gösterilir). */
  title: string
  /** 2 metinsiz İngilizce ChatGPT/AI görsel üretim promptu (aynı temanın 2 farklı kompozisyonu). */
  imagePrompts: string[]
  /** Hazır Türkçe LinkedIn postu (numarasız gövde, emoji dahil). */
  linkedinPost: string
}

const BRAND_STYLE =
  'Use a polished contemporary editorial-illustration style with expressive simplified people, a soft dimensional vector and gentle 3D hybrid, rounded forms, smooth gradients, subtle depth and soft Mediterranean afternoon light. It does not need to look realistic; prioritize clarity, emotion and symbolic storytelling. Use the Kaş Guide visual system: warm sun-bleached limestone and ivory background, deep Aegean turquoise and navy as dominant colors, and controlled terracotta, olive-green, sandy-gold and coral accents evoking the Turkish Riviera. Keep the mood warm, trustworthy, local and modern. Square 1:1 composition at 1024x1024, strong thumbnail readability, one clear hierarchy, and at least 12% safe margin around every essential person and symbol. Keep all faces, hands and important objects fully inside the frame. No text, no letters, no readable numbers, no logos, no brand names, no watermark. Avoid photorealism, camera or lens aesthetics, stock-photo posing, clutter, excessive detail, distorted anatomy and unreadable fake interface text.'

function prompt(scene: string, symbols: string): string {
  return `Create a premium square 1:1 human-centered editorial illustration for Kaş Guide, a comprehensive city guide platform for Kaş, Antalya on the Turkish Mediterranean coast. Scene: ${scene} At least one clearly visible human figure must be present and must remain the emotional center of the composition; use a small group only when the scene genuinely requires interaction. Around the person or group, arrange a balanced set of simple rounded contextual symbols that explain the idea immediately: ${symbols}. Translate the most important objects and signals from the scene into these surrounding symbols, using a halo, orbit, pathway or spatial cluster rather than a dense interface. Any phone or tablet may appear only as a secondary prop with abstract shapes; do not make screens or tiny interface details the main visual story. ${BRAND_STYLE}`
}

export const SOCIAL_LINKEDIN_POSTS: SocialLinkedinPost[] = [
  // ————————————————————————————————————————————————————————————
  // KATEGORİ TANITIMLARI (1-20) — src/lib/categories.ts'deki 20 gerçek kategori
  // ————————————————————————————————————————————————————————————
  {
    id: 'post-1',
    order: 1,
    category: 'kategori',
    title: 'Bar Kategorisi',
    imagePrompts: [
      prompt(
        'A small group of friends clink glasses at a rooftop bar terrace overlooking the Kaş harbor at sunset, warm string lights overhead, silhouettes of sailboats in the bay below.',
        'a cocktail glass, string lights, a crescent moon, a harbor silhouette, a small anchor icon, and a sound-wave motif for music',
      ),
      prompt(
        'A bartender in a cozy stone-walled Kaş bar mixes a drink while two travelers chat on high stools, warm amber lighting, bottles on wooden shelves in the background.',
        'a shaker icon, citrus slice, warm bulb light, a vinyl record, a map pin marking "Kaş", and a chat bubble',
      ),
    ],
    linkedinPost: `🍸 Kaş'ta gece nerede başlar?

Kaş Guide'da "Bar" kategorisi; liman manzaralı teraslardan, taş duvarlı sokak aralarındaki samimi meyhane-barlara kadar şehrin en iyi akşam duraklarını tek yerde topluyor.

Her mekan gerçek konum, fotoğraf ve doğrulanmış bilgiyle listelenir — tahmin yok, doğrudan gidip görebileceğin yerler var. 🌅

👉 kasguide.com

#KaşGuide #Kaş #Antalya #BarKültürü #ŞehirRehberi`,
  },
  {
    id: 'post-2',
    order: 2,
    category: 'kategori',
    title: 'Meyhane Kategorisi',
    imagePrompts: [
      prompt(
        'An extended family and friends gather around a long wooden meyhane table filled with small mezze plates, raki glasses and fresh fish, warm evening light through an open taverna window in Kaş.',
        'a small raki glass, mezze plate, olive branch, fish icon, string of lights, and a music note for live fasıl music',
      ),
      prompt(
        'A local chef presents a tray of colorful mezze dishes at the entrance of a traditional Kaş meyhane, stone archway and hanging dried peppers visible behind them.',
        'a mezze tray, olive branch, dried pepper string, a small ceramic jug, and a warm lantern',
      ),
    ],
    linkedinPost: `🍷 Meze, rakı, sohbet — ve deniz sesi.

Kaş Guide'ın "Meyhane" kategorisi, şehrin geleneksel meze kültürünü yaşatan mekanları bir araya getiriyor. Taş duvarlı sokak aralarındaki aile işletmesinden, deniz kenarındaki köklü meyhanelere kadar.

Doğrulanmış mekan bilgisi, gerçek fotoğraflar, net konum. 📍

👉 kasguide.com

#KaşGuide #Meyhane #TürkMutfağı #Kaş #Antalya`,
  },
  {
    id: 'post-3',
    order: 3,
    category: 'kategori',
    title: 'Restoran Kategorisi',
    imagePrompts: [
      prompt(
        'A couple enjoys a candlelit seafood dinner at a waterfront restaurant table in Kaş, the harbor and anchored yachts glowing softly in the background at dusk.',
        'a plated fish dish, a candle flame, a wine glass, a small boat silhouette, and a fork-and-knife icon',
      ),
      prompt(
        'A chef plates a fresh seafood dish in an open exhibition kitchen while diners watch from a rustic wooden counter in a Kaş restaurant.',
        'a chef hat, a fish icon, a steam curl, a herb sprig, and a small serving bell',
      ),
    ],
    linkedinPost: `🍽️ Kaş'ta nerede, ne yesem?

Kaş Guide'da "Restoran" kategorisi; taze deniz ürünlerinden Akdeniz mutfağına, aile işletmesi lokantalardan şık liman restoranlarına kadar geniş bir seçki sunuyor.

Her mekan için gerçek fotoğraf, konum ve güncel bilgi — hepsi tek ekranda. 🐟

👉 kasguide.com

#KaşGuide #Restoran #DenizÜrünleri #Kaş #Gastronomi`,
  },
  {
    id: 'post-4',
    order: 4,
    category: 'kategori',
    title: 'Kafe Kategorisi',
    imagePrompts: [
      prompt(
        'A woman reads a book at a shaded outdoor cafe table on a narrow Kaş street, a steaming coffee cup and pastry in front of her, bougainvillea flowers draping the wall behind.',
        'a coffee cup with steam, an open book, a bougainvillea flower, a small pastry, and a sun icon',
      ),
      prompt(
        'A barista prepares a pour-over coffee behind a rustic wooden counter in a bright Kaş cafe, sunlight streaming through large windows onto exposed stone walls.',
        'a pour-over kettle, coffee bean icon, sunbeam, a small potted plant, and a ceramic cup',
      ),
    ],
    linkedinPost: `☕ Yavaşlamanın adresi.

Kaş Guide'ın "Kafe" kategorisi; taş sokaklardaki gölgeli teraslardan, deniz manzaralı kahve duraklarına kadar şehrin en keyifli mola noktalarını listeler.

Kahve, manzara ve biraz da zaman — Kaş'ta hepsi cebinde. 🌤️

👉 kasguide.com

#KaşGuide #Kafe #Kahve #Kaş #YavaşYaşam`,
  },
  {
    id: 'post-5',
    order: 5,
    category: 'kategori',
    title: 'Kahvaltı Kategorisi',
    imagePrompts: [
      prompt(
        'A large traditional Turkish breakfast spread covers a table on a sunny terrace overlooking the Kaş coastline, a family reaching for small plates of cheese, olives and honey.',
        'a small cheese plate, honey jar, olive bowl, teapot, and a sunrise-over-sea motif',
      ),
      prompt(
        'A server places a fresh simit and glass of tea in front of a smiling traveler at an outdoor breakfast table with a sea view in Kaş.',
        'a simit ring, a tulip-shaped tea glass, a jam jar, and a small seagull silhouette',
      ),
    ],
    linkedinPost: `🍳 Güne Kaş usulü başlamak.

Kaş Guide'da "Kahvaltı" kategorisi; serpme kahvaltı sofralarından sade ama lezzetli sabah mekanlarına kadar, güne doğru yerde başlamanı sağlıyor.

Manzara mı, çeşit mi, hız mı önemli — filtrele, bul, git. 🫖

👉 kasguide.com

#KaşGuide #Kahvaltı #SerpmeKahvaltı #Kaş`,
  },
  {
    id: 'post-6',
    order: 6,
    category: 'kategori',
    title: 'Oteller Kategorisi',
    imagePrompts: [
      prompt(
        'A traveler stands on a hotel balcony in Kaş, suitcase beside them, looking out over a turquoise bay lined with whitewashed buildings and pine-covered hills.',
        'a suitcase, a balcony railing, a key card, a turquoise wave shape, and a small pine tree',
      ),
      prompt(
        'A small boutique guesthouse courtyard in Kaş with a traveler checking in at a rustic wooden reception desk, bougainvillea climbing the stone walls around them.',
        'a key icon, a bougainvillea flower, a small suitcase, a welcome mat shape, and a sun icon',
      ),
    ],
    linkedinPost: `🛏️ Kaş'ta kalacak yer ararken.

Kaş Guide'ın "Oteller" kategorisi; butik pansiyonlardan konforlu otellere, misafirhanelerden deniz manzaralı tesislere kadar tüm konaklama seçeneklerini tek listede sunar.

Gerçek fotoğraf, konum ve doğrulanmış bilgiyle karar vermek çok daha kolay. 🌊

👉 kasguide.com

#KaşGuide #Oteller #Konaklama #Kaş #TatilPlanı`,
  },
  {
    id: 'post-7',
    order: 7,
    category: 'kategori',
    title: 'Tarih Kategorisi',
    imagePrompts: [
      prompt(
        'A traveler explores the ancient Lycian rock tombs carved into the cliffside above Kaş, gazing up in wonder with the town and sea visible below.',
        'an ancient column, a rock-tomb silhouette, a scroll icon, a small compass, and a sunbeam',
      ),
      prompt(
        'A small group walks through the ruins of an ancient theater near Kaş, tiered stone seats curving around them, sea glimpsed through the amphitheater arches.',
        'an amphitheater arch, a laurel wreath, an ancient column, and a small scroll',
      ),
    ],
    linkedinPost: `🕰️ Kaş sadece deniz değil — bin yılların izi.

Kaş Guide'ın "Tarih" kategorisi; antik Likya kaya mezarlarından amfitiyatroya, şehrin tarihi dokusunu keşfetmek isteyenler için doğrulanmış mekan bilgisi sunuyor.

Her taşın bir hikayesi var, biz sana yerini gösteriyoruz. 🏛️

👉 kasguide.com

#KaşGuide #Likya #Tarih #Kaş #AntikKent`,
  },
  {
    id: 'post-8',
    order: 8,
    category: 'kategori',
    title: 'Doğa Kategorisi',
    imagePrompts: [
      prompt(
        'A hiker pauses on a pine-lined coastal trail near Kaş, looking out over dramatic cliffs and the deep blue Mediterranean below.',
        'a pine tree, a hiking trail path, a mountain silhouette, a small compass, and a bird in flight',
      ),
      prompt(
        'A small group sits on rocks at a secluded natural viewpoint near Kaş surrounded by wild Mediterranean shrubs, watching the sun set over the sea.',
        'a wildflower, a sun setting over waves, a rocky outcrop shape, and a small leaf',
      ),
    ],
    linkedinPost: `🌿 Kaş'ın yeşili, mavisi kadar güzel.

"Doğa" kategorisiyle Kaş Guide; çam ormanlarından kıyı patikalarına, gizli manzara noktalarına kadar şehrin doğal güzelliklerini haritalıyor.

Şehir merkezinden birkaç adım uzakta, bambaşka bir Kaş seni bekliyor. 🥾

👉 kasguide.com

#KaşGuide #Doğa #Likyayolu #Kaş #Doğayürüyüşü`,
  },
  {
    id: 'post-9',
    order: 9,
    category: 'kategori',
    title: 'Plaj Kategorisi',
    imagePrompts: [
      prompt(
        'A family relaxes on a pebble beach in a dramatic cliff-lined cove near Kaş, crystal-clear turquoise water and a small boat anchored offshore.',
        'a beach umbrella, a wave shape, a starfish, a small anchored boat, and a sun icon',
      ),
      prompt(
        'A swimmer floats in the clear turquoise water of a secluded Kaş beach cove, dramatic limestone cliffs rising behind them.',
        'a wave shape, a snorkel mask, a cliff silhouette, and a small fish icon',
      ),
    ],
    linkedinPost: `🏖️ Kaputaş mı, gizli bir koy mu?

Kaş Guide'ın "Plaj" kategorisi; ünlü Kaputaş'tan az bilinen sakin koylara kadar Kaş'ın en güzel plajlarını tek listede topluyor.

Aile dostu kumsal mı arıyorsun, yoksa sessiz bir köşe mi — filtrele ve bul. 🌊

👉 kasguide.com

#KaşGuide #Plaj #Kaputaş #Kaş #Akdeniz`,
  },
  {
    id: 'post-10',
    order: 10,
    category: 'kategori',
    title: 'Çarşı Kategorisi',
    imagePrompts: [
      prompt(
        'A traveler browses handmade ceramics and textiles at a small shop stall in the narrow bazaar streets of Kaş, colorful goods hanging along the stone walls.',
        'a ceramic vase, a woven textile, a small shopping bag, and a string of lights overhead',
      ),
      prompt(
        'A local shopkeeper arranges fresh produce and local goods at a small market stand in Kaş, sunlight filtering through a canvas awning above.',
        'a fruit basket, a canvas awning shape, a small scale icon, and a woven basket',
      ),
    ],
    linkedinPost: `🛍️ Kaş'ın dar sokaklarında bir keşif turu.

"Çarşı" kategorisi; el yapımı seramiklerden yerel ürünlere, hediyelik eşya dükkanlarından küçük pazarlara kadar Kaş'ın alışveriş dokusunu tek yerde gösteriyor.

Yerelin elinden çıkanı bulmak artık çok daha kolay. 🎁

👉 kasguide.com

#KaşGuide #Çarşı #YerelÜretim #Kaş #Alışveriş`,
  },
  {
    id: 'post-11',
    order: 11,
    category: 'kategori',
    title: 'Gezi Kategorisi',
    imagePrompts: [
      prompt(
        'A traveler studies an exhibit inside a small museum gallery in Kaş, ancient artifacts displayed in soft gallery lighting around them.',
        'a museum artifact silhouette, a picture frame, a small info-plaque shape, and a spotlight beam',
      ),
      prompt(
        'A group of tourists listens to a guide at a scenic viewpoint overlooking Kaş town and the Greek island of Meis in the distance.',
        'a guidebook icon, a viewpoint telescope, a distant island silhouette, and a small flag marker',
      ),
    ],
    linkedinPost: `🧭 Kaş'ı gerçekten tanımak isteyenlere.

"Gezi" kategorisi; müzelerden sanat galerilerine, turist bilgi noktalarından manzara duraklarına kadar şehri keşfetmek için ihtiyacın olan tüm mekanları bir araya getiriyor.

Nereden başlayacağını bilmiyorsan, iyi bir başlangıç noktası burada. 🗺️

👉 kasguide.com

#KaşGuide #Gezi #ŞehirRehberi #Kaş #Keşfet`,
  },
  {
    id: 'post-12',
    order: 12,
    category: 'kategori',
    title: 'Dalış Kategorisi',
    imagePrompts: [
      prompt(
        'A diver descends into the clear blue water off the Kaş coast near a marina, sunlight rays penetrating the water above a rocky reef below.',
        'a diving mask, an oxygen tank shape, a sunray through water, and a small fish school',
      ),
      prompt(
        'A group of divers prepares their gear on a boat deck at a Kaş marina before a diving trip, wetsuits and tanks laid out around them.',
        'a wetsuit silhouette, an oxygen tank, a boat deck plank pattern, and a compass',
      ),
    ],
    linkedinPost: `🤿 Kaş'ın su altı dünyası, yüzeyi kadar zengin.

Kaş Guide'ın "Dalış" kategorisi; Akdeniz'in en iyi dalış noktalarından biri olan Kaş'taki dalış merkezlerini ve marinaları tek listede sunuyor.

Yeni başlayan da, deneyimli dalgıç da kendine uygun mekanı buluyor. 🐠

👉 kasguide.com

#KaşGuide #Dalış #ScubaDiving #Kaş #Akdeniz`,
  },
  {
    id: 'post-13',
    order: 13,
    category: 'kategori',
    title: 'Aktivite Kategorisi',
    imagePrompts: [
      prompt(
        'A person practices yoga on a terrace overlooking the Kaş bay at sunrise, calm sea and distant hills in soft morning light.',
        'a yoga pose silhouette, a sunrise arc, a small lotus flower, and a gentle wave line',
      ),
      prompt(
        'A group sets off on a guided tour van outside a Kaş travel agency office, hiking bags and paragliding gear visible nearby.',
        'a paraglider wing shape, a hiking boot, a small map icon, and a travel bag',
      ),
    ],
    linkedinPost: `⚡ Kaş'ta enerjini nerede harcarsın?

"Aktivite" kategorisi; yoga stüdyolarından tur acentelerine, spa merkezlerinden parklara kadar Kaş'ta yapılabilecek her şeyi tek çatı altında topluyor.

Sakinleşmek de, adrenalin de bu listede var. 🧘

👉 kasguide.com

#KaşGuide #Aktivite #Yoga #Kaş #Wellness`,
  },
  {
    id: 'post-14',
    order: 14,
    category: 'kategori',
    title: 'Yazılar Kategorisi',
    imagePrompts: [
      prompt(
        'A writer sits at a small desk by an open window overlooking Kaş rooftops, typing on a laptop with notebooks and a coffee cup nearby.',
        'an open notebook, a pen, a laptop silhouette, a coffee cup, and a small speech-bubble',
      ),
      prompt(
        'A reader relaxes in a hammock on a shaded terrace, phone in hand reading an article, Kaş coastline visible through the trees behind them.',
        'a hammock shape, an open book, a small leaf, and a reading-lamp glow',
      ),
    ],
    linkedinPost: `📝 Kaş hakkında okumaya değer her şey.

"Yazılar" kategorisi; Kaş Guide'ın editoryal içeriklerini — rehberler, öneriler, yerel bakış açıları — tek yerde topluyor.

Gitmeden önce okumak isteyenler için hazırlandı. ✍️

👉 kasguide.com

#KaşGuide #İçerik #SeyahatYazıları #Kaş`,
  },
  {
    id: 'post-15',
    order: 15,
    category: 'kategori',
    title: 'Röportaj Kategorisi',
    imagePrompts: [
      prompt(
        'A local shop owner in Kaş speaks warmly with an interviewer holding a microphone in a cozy stone-walled shop interior.',
        'a microphone icon, a speech bubble, a small recording waveform, and a warm lamp glow',
      ),
      prompt(
        'Two people sit across a small cafe table having an animated conversation, a voice recorder placed between their coffee cups, Kaş street visible through the window.',
        'a voice-recorder shape, a coffee cup, a small notebook, and a sound-wave line',
      ),
    ],
    linkedinPost: `🎙️ Kaş'ı en iyi kim anlatır? Orada yaşayanlar.

"Röportaj" kategorisi; yerel işletme sahipleri, zanaatkarlar ve Kaş'ın gerçek hikayesini bilen insanlarla yapılan söyleşileri bir araya getiriyor.

Turist gözünden değil, yerelin gözünden bir Kaş. 🗣️

👉 kasguide.com

#KaşGuide #Röportaj #YerelHikayeler #Kaş`,
  },
  {
    id: 'post-16',
    order: 16,
    category: 'kategori',
    title: 'Fotoğraf Kategorisi',
    imagePrompts: [
      prompt(
        'A photographer kneels at a cliffside viewpoint near Kaş at golden hour, camera raised toward the glowing sea and silhouetted pine trees.',
        'a camera silhouette, a golden sun, a pine-tree shape, and a small lens-flare sparkle',
      ),
      prompt(
        'A traveler reviews photos on a camera screen while sitting on harbor-side steps in Kaş, boats and sunset colors reflected in the water behind them.',
        'a camera icon, a photo-frame shape, a small boat silhouette, and a sunset gradient arc',
      ),
    ],
    linkedinPost: `📷 Kaş'ın en fotojenik köşeleri.

"Fotoğraf" kategorisi; gün batımı noktalarından gizli kareler yakalayabileceğin sokaklara kadar, kadraja değer yerleri işaretliyor.

Instagram'da paylaşmadan önce nereye gideceğini bil. 🌅

👉 kasguide.com

#KaşGuide #Fotoğraf #GünBatımı #Kaş`,
  },
  {
    id: 'post-17',
    order: 17,
    category: 'kategori',
    title: 'O.S.S. Kategorisi (Soru-Cevap)',
    imagePrompts: [
      prompt(
        'A traveler sits on a bench reading answers on a phone with a thoughtful expression, a small speech-bubble cloud of questions floating gently above them, Kaş street in the background.',
        'a question-mark bubble, a checkmark, a small lightbulb, and a phone silhouette',
      ),
      prompt(
        'A visitor asks a local guide a question at a small kiosk, both smiling, information brochures visible on the counter between them.',
        'a question mark, an info-brochure shape, a small lightbulb, and a checkmark',
      ),
    ],
    linkedinPost: `🧠 Kaş hakkında merak ettiğin her şey.

"O.S.S." (Ofis-Soru-Sorun) kategorisi; en çok sorulan soruların doğrulanmış, net cevaplarını tek yerde topluyor — ulaşım, güvenlik, mevsim, bütçe, ne bileyim, her şey.

Sormadan önce bak, belki cevap zaten orada. 💬

👉 kasguide.com

#KaşGuide #SSS #SeyahatRehberi #Kaş`,
  },
  {
    id: 'post-18',
    order: 18,
    category: 'kategori',
    title: 'Kaş Local Kategorisi',
    imagePrompts: [
      prompt(
        'A local resident waters plants on their balcony overlooking a quiet Kaş neighborhood street early in the morning, warm light and cats resting nearby.',
        'a watering can, a potted plant, a small cat silhouette, and a sunrise glow',
      ),
      prompt(
        'A neighborhood gathering in a small Kaş square, locals chatting over tea at outdoor tables under a large plane tree.',
        'a tea glass, a tree-canopy shape, a small bench, and a speech bubble',
      ),
    ],
    linkedinPost: `📍 Turist değil, yerel gözünden Kaş.

"Kaş Local" kategorisi; şehirde yaşayanların günlük hayatını, mahalle kültürünü ve turistik rotaların dışında kalan gerçek Kaş'ı anlatıyor.

Bir yeri gerçekten tanımak, orada yaşayanları dinlemekle başlar. 🏘️

👉 kasguide.com

#KaşGuide #YerelYaşam #Kaş #Mahalle`,
  },
  {
    id: 'post-19',
    order: 19,
    category: 'kategori',
    title: 'Acil Durum Kategorisi',
    imagePrompts: [
      prompt(
        'A calm pharmacist hands medicine to a traveler at a well-lit pharmacy counter in Kaş, a red cross symbol glowing softly on the storefront sign outside.',
        'a red cross icon, a first-aid kit shape, a small clock, and a phone silhouette',
      ),
      prompt(
        'A traveler checks a phone for directions near a clearly marked hospital sign on a Kaş street corner at dusk, streetlights beginning to glow.',
        'a hospital cross sign, a location pin, a phone silhouette, and a small clock',
      ),
    ],
    linkedinPost: `🚨 Tatildeyken de aklın rahat olsun.

"Acil Durum" kategorisi; Kaş'taki eczane, hastane ve acil yardım noktalarının güncel konum ve iletişim bilgilerini tek yerde topluyor.

İhtiyacın olmasın, ama bilmen iyi olur. 🏥

👉 kasguide.com

#KaşGuide #AcilDurum #Güvenlik #Kaş`,
  },
  {
    id: 'post-20',
    order: 20,
    category: 'kategori',
    title: 'Patililer Kategorisi',
    imagePrompts: [
      prompt(
        'A traveler walks their dog along a pet-friendly waterfront promenade in Kaş, a water bowl set outside a nearby cafe, the sea sparkling beside them.',
        'a paw print, a dog leash shape, a small water bowl, and a wave line',
      ),
      prompt(
        'A small dog rests contentedly under a cafe table on a shaded Kaş terrace while its owner enjoys a coffee, sea view in the background.',
        'a paw print, a coffee cup, a small dog-bone shape, and a sun icon',
      ),
    ],
    linkedinPost: `🐾 Patili dostlar da Kaş'ı hak ediyor.

"Patililer" kategorisi; evcil hayvan dostu kafe, plaj ve konaklama seçeneklerini işaretleyerek dört ayaklı yol arkadaşınla seyahati kolaylaştırıyor.

Onu evde bırakmana gerek yok. 🐶

👉 kasguide.com

#KaşGuide #PetFriendly #Patililer #Kaş`,
  },

  // ————————————————————————————————————————————————————————————
  // PLATFORM ÖZELLİKLERİ (21-38)
  // ————————————————————————————————————————————————————————————
  {
    id: 'post-21',
    order: 21,
    category: 'ozellik',
    title: 'Kategori Filtreleme',
    imagePrompts: [
      prompt(
        'A traveler sits at a cafe table swiping through a phone, colorful category icons (food, beach, hotel, activity) gently arranged around the screen like a fan of cards.',
        'a filter funnel icon, small category tiles, a fork-and-knife, a beach umbrella, and a hotel-bed icon',
      ),
      prompt(
        'A family plans their day around a table, pointing at different category icons laid out like a menu, Kaş rooftops visible through the window behind them.',
        'a checklist icon, category tiles, a compass, and a small calendar page',
      ),
    ],
    linkedinPost: `🎯 20 kategori, tek filtre satırı.

Kaş Guide'da yeme-içme, konaklama, doğa, aktivite ve içerik kategorileri arasında saniyeler içinde geçiş yapabiliyorsun. Ne aradığını söyle, gerisini platform halletsin.

Karmaşık menüler yok, direkt sonuç var. ⚡

👉 kasguide.com

#KaşGuide #ÜrünÖzelliği #Kaş #ŞehirRehberi`,
  },
  {
    id: 'post-22',
    order: 22,
    category: 'ozellik',
    title: 'Arama Motoru (Mekan + SSS)',
    imagePrompts: [
      prompt(
        'A traveler types a search query into a phone at a harbor-side bench in Kaş, gentle result cards (a beach, a question mark, a restaurant plate) floating around them.',
        'a magnifying glass, a search-bar shape, a question-mark bubble, and a small result-card stack',
      ),
      prompt(
        'A woman sits on a low wall in a narrow Kaş street, searching on her phone, two glowing content clusters (places and Q&A) orbiting softly around her.',
        'a magnifying glass, a question mark, a location pin, and a small stack of cards',
      ),
    ],
    linkedinPost: `🔍 "Kahvaltı" yaz, hem mekan hem cevap gelsin.

Kaş Guide'ın arama motoru; hem yayınlanmış mekanları hem de soru-cevap arşivini aynı anda tarıyor. Türkçe karakter normalizasyonu sayesinde "kahvalti" da, "kahvaltı" da aynı sonucu getiriyor.

Aramak, bulmak kadar kolay olmalı. 🧭

👉 kasguide.com/arama

#KaşGuide #Arama #ÜrünÖzelliği #Kaş`,
  },
  {
    id: 'post-23',
    order: 23,
    category: 'ozellik',
    title: 'Günlük Planlayıcı (25 Soru)',
    imagePrompts: [
      prompt(
        'A couple answers a short quiz on a tablet at a breakfast table overlooking the Kaş coast, small icons (sun, beach, fork, boat) appearing one by one as they tap through questions.',
        'a checklist icon, a quiz-question bubble, a compass, and small activity icons (sun, wave, fork)',
      ),
      prompt(
        'A traveler receives a personalized daily itinerary card on their phone while sitting on a sunny terrace, a route line connecting small place icons across the Kaş map.',
        'a route-line path, a location pin, a small itinerary-card shape, and a sun icon',
      ),
    ],
    linkedinPost: `🧭 25 soru, sana özel bir Kaş günü.

Kaş Guide'ın Günlük Planlayıcı'sı; birkaç soruyu yanıtlamanla birlikte ilgi alanlarına uygun mekan ve rota önerileri sunuyor.

Ne yapacağını düşünmekten yorulmak yok — planla, git, yaşa. 📋

👉 kasguide.com/planner

#KaşGuide #Planlayıcı #ÜrünÖzelliği #Kaş`,
  },
  {
    id: 'post-24',
    order: 24,
    category: 'ozellik',
    title: 'Doğrulanmış Mekan Rozetleri',
    imagePrompts: [
      prompt(
        'A small business owner proudly points to a verification badge glowing softly above their shop entrance in Kaş, a traveler nodding approvingly nearby.',
        'a checkmark badge, a small shield shape, a shop-front outline, and a sparkle',
      ),
      prompt(
        'A traveler compares two phone screens showing place listings, one with a glowing verified badge, sitting at an outdoor table in Kaş.',
        'a verified checkmark badge, a small shield, a comparison-arrow shape, and a location pin',
      ),
    ],
    linkedinPost: `✅ Gerçek mi, güncel mi, doğru mu?

Kaş Guide'da her mekan bir doğrulama sürecinden geçiyor: pending → review → admin → published. Yayınlanan her kayıt, ekibimiz tarafından kontrol edilmiş demektir.

İnternette rastgele bilgi bol; biz doğrulanmışı seçtik. 🛡️

👉 kasguide.com

#KaşGuide #Doğrulama #Güven #Kaş`,
  },
  {
    id: 'post-25',
    order: 25,
    category: 'ozellik',
    title: 'Harita ve Konum Entegrasyonu',
    imagePrompts: [
      prompt(
        'A traveler holds a phone showing a map pin while standing on a narrow Kaş street, gently glowing location markers scattered across a stylized coastline behind them.',
        'a location pin, a map-route line, a small compass, and a coastline shape',
      ),
      prompt(
        'A family walks toward a beach following a soft glowing path on their phone screen, Kaş cliffs and turquoise water visible ahead of them.',
        'a location pin, a dotted path line, a small beach-umbrella icon, and a compass rose',
      ),
    ],
    linkedinPost: `📍 Adres tarif etmeye gerek yok.

Her mekan kaydı gerçek koordinatlarla (enlem/boylam) işaretli. Kaş Guide'dan bir yer seç, direkt haritada bul, yürü, git.

Kaybolmak, artık plan dışı bir seçenek. 🗺️

👉 kasguide.com

#KaşGuide #Harita #Navigasyon #Kaş`,
  },
  {
    id: 'post-26',
    order: 26,
    category: 'ozellik',
    title: 'Hero Slider / Öne Çıkanlar',
    imagePrompts: [
      prompt(
        'A traveler watches a large glowing carousel of Kaş imagery (beach, harbor, ruins) flip past on a tablet screen while sitting at a sunny outdoor cafe.',
        'a carousel-frame shape, a small arrow icon, a sun icon, and a stack of photo cards',
      ),
      prompt(
        'A phone screen rests on a wooden table showing a bright rotating banner of Kaş highlights, a coffee cup and sunglasses placed beside it.',
        'a photo-frame carousel shape, a small arrow, sunglasses, and a coffee cup',
      ),
    ],
    linkedinPost: `✨ İlk bakışta Kaş'ın en iyileri.

Ana sayfadaki hero slider; mevsime, öne çıkan mekanlara ve güncel içeriklere göre düzenlenen dinamik bir vitrin. Admin panelinden anında güncellenir.

Platforma girer girmez ne önemliyse onu görürsün. 🎬

👉 kasguide.com

#KaşGuide #ÜrünÖzelliği #Kaş`,
  },
  {
    id: 'post-27',
    order: 27,
    category: 'ozellik',
    title: 'Haberler Akışı',
    imagePrompts: [
      prompt(
        'A resident reads a local news article on their phone while sitting on a harbor bench in Kaş, a small newspaper-fold icon glowing softly above the screen.',
        'a newspaper-fold icon, a small bell notification, a location pin, and a speech bubble',
      ),
      prompt(
        'A cafe owner points at a printed local news flyer taped to a shop window, a traveler reading it with interest, Kaş street scene around them.',
        'a newspaper-fold icon, a small pin, a megaphone shape, and a calendar page',
      ),
    ],
    linkedinPost: `📰 Kaş'ta ne oluyor, hep güncel.

Haberler akışı; şehirle ilgili gelişmeleri, yerel etkinlikleri ve önemli duyuruları tek yerde topluyor. Kaynak bazlı otomatik tarama ile beslenen sistem, editör onayından geçerek yayınlanıyor.

Gruplardan değil, doğrulanmış kaynaktan haber al. 📣

👉 kasguide.com/haberler

#KaşGuide #Haberler #Kaş #YerelGündem`,
  },
  {
    id: 'post-28',
    order: 28,
    category: 'ozellik',
    title: 'Duyurular ve Öncelik Sistemi',
    imagePrompts: [
      prompt(
        'A shop owner pins an important announcement note to a community board in a Kaş square, a small group reading it with attentive expressions.',
        'a pin-board shape, an exclamation-mark badge, a small calendar icon, and a megaphone',
      ),
      prompt(
        'A traveler notices a highlighted urgent announcement banner glowing on their phone screen while walking through a Kaş street market.',
        'an exclamation badge, a glowing banner shape, a small clock, and a location pin',
      ),
    ],
    linkedinPost: `📢 Acil mi, bilgi mi, süreli mi?

Duyurular sistemi; öncelik seviyesine göre (acil / normal / bilgi) ve görünürlük tarihine göre çalışır. Önemli olan üstte, süresi geçen otomatik arşivde.

Bilgi kirliliği yok, sadece gerekeni göster. 🔔

👉 kasguide.com/duyurular

#KaşGuide #Duyurular #Kaş #Bilgilendirme`,
  },
  {
    id: 'post-29',
    order: 29,
    category: 'ozellik',
    title: 'Mekan Öner (Kullanıcı Katkısı)',
    imagePrompts: [
      prompt(
        'A cafe owner fills out a simple submission form on a tablet at their counter, a soft glowing "new place" icon appearing above the screen as they submit it.',
        'a form-document icon, a plus-sign badge, a small shop-front shape, and a checkmark',
      ),
      prompt(
        'A local resident points a phone camera at their favorite hidden viewpoint to submit it to a guide app, Kaş coastline stretching behind them.',
        'a camera icon, a plus-sign badge, a location pin, and a small upload-arrow',
      ),
    ],
    linkedinPost: `➕ Bildiğin güzel bir yer mi var?

"Mekan Öner" özelliğiyle herkes Kaş Guide'a yeni bir mekan önerebiliyor. Öneriler inceleme sürecinden geçip doğrulandıktan sonra platforma ekleniyor.

En iyi keşifler çoğu zaman yerelden gelir. 🙌

👉 kasguide.com/mekan-oner

#KaşGuide #TopluluğaAçık #Kaş #Keşfet`,
  },
  {
    id: 'post-30',
    order: 30,
    category: 'ozellik',
    title: 'Otomatik Haber Tarama (Scraper)',
    imagePrompts: [
      prompt(
        'An editor reviews a queue of incoming news drafts on a laptop screen in a bright office, small RSS-feed icons flowing gently into an inbox tray beside them.',
        'an RSS-feed icon, a small inbox tray, a checkmark, and a flowing-arrow line',
      ),
      prompt(
        'A content moderator sits at a desk approving a batch of automatically gathered local news items, soft glowing feed icons arranged around the monitor.',
        'an RSS icon, a filter funnel, a small approval-checkmark, and a stack of document cards',
      ),
    ],
    linkedinPost: `🔄 Haberi biz aramıyoruz, sistem topluyor.

Kaş Guide'ın admin panelinde çalışan otomatik haber tarama sistemi; tanımlı RSS/Atom kaynaklarını düzenli olarak tarar, editör onayına sunar.

Manuel takip değil, akıllı otomasyon. ⚙️

👉 kasguide.com

#KaşGuide #Otomasyon #Haberler #Kaş`,
  },
  {
    id: 'post-31',
    order: 31,
    category: 'ozellik',
    title: 'AI Destekli Mekan Keşif Sistemi',
    imagePrompts: [
      prompt(
        'A person reviews a set of newly discovered candidate business listings on a laptop, small glowing search and AI-brain icons hovering above the screen in a bright office.',
        'a small AI-brain icon, a magnifying glass, a stack of candidate cards, and a checkmark',
      ),
      prompt(
        'An admin approves a new place candidate on a tablet at a desk, a soft glowing arrow showing it moving from a "candidate" pile into a "published" folder.',
        'an arrow-transition shape, a folder icon, a checkmark badge, and a small star',
      ),
    ],
    linkedinPost: `🤖 Yeni mekanları AI keşfediyor, insan onaylıyor.

Kaş Guide'ın hizmet arama sistemi; web'de Kaş'la ilgili yeni işletmeleri tarar, sınıflandırır ve aday olarak sunar. Son karar her zaman editör onayında.

Teknoloji hız katar, doğruluğu insan garanti eder. ✅

👉 kasguide.com

#KaşGuide #YapayZeka #Otomasyon #Kaş`,
  },
  {
    id: 'post-32',
    order: 32,
    category: 'ozellik',
    title: 'Mekan Detay Sayfaları',
    imagePrompts: [
      prompt(
        'A traveler scrolls through a rich place detail page on their phone while sitting at the actual restaurant table shown on the screen, comparing photo to reality with a smile.',
        'a photo-gallery icon, a star-rating shape, a location pin, and a small phone silhouette',
      ),
      prompt(
        'A couple compares photos, badges and description text on a place detail screen before entering a boutique hotel lobby in Kaş.',
        'a badge-shield icon, a photo-stack, a small info-card, and a checkmark',
      ),
    ],
    linkedinPost: `📄 Bir mekan hakkında bilmen gereken her şey, tek sayfada.

Fotoğraf galerisi, açıklama, rozetler, konum ve iletişim bilgisi — Kaş Guide'daki her mekan detay sayfası eksiksiz ve güncel tutulur.

Karar vermeden önce her şeyi gör. 🖼️

👉 kasguide.com

#KaşGuide #MekanDetayı #Kaş #ŞehirRehberi`,
  },
  {
    id: 'post-33',
    order: 33,
    category: 'ozellik',
    title: 'Mobil Uyumlu Deneyim',
    imagePrompts: [
      prompt(
        'A traveler walks along a Kaş harbor promenade browsing a smooth, clean mobile interface on their phone, sea breeze moving their hair, sunset colors in the sky.',
        'a smartphone silhouette, a location pin, a small wave line, and a sunset gradient',
      ),
      prompt(
        'A backpacker checks their phone for directions while standing at a scenic Kaş overlook, phone screen glowing softly with a simple clean layout.',
        'a smartphone icon, a compass, a small signal-bar icon, and a mountain silhouette',
      ),
    ],
    linkedinPost: `📱 Cebinde bir Kaş rehberi.

Kaş Guide, mobilde de masaüstünde de aynı hızda, aynı netlikte çalışır. Yolda, plajda, otobüs beklerken — nerede olursan ol erişim kolay.

Rehber, seninle birlikte hareket etmeli. 🚶

👉 kasguide.com

#KaşGuide #Mobil #KullanıcıDeneyimi #Kaş`,
  },
  {
    id: 'post-34',
    order: 34,
    category: 'ozellik',
    title: 'Türkçe Karakter Normalizasyonu',
    imagePrompts: [
      prompt(
        'A developer smiles while typing at a laptop, small floating Turkish letters (ş, ğ, ı, ö, ü, ç) gently transforming into their normalized forms above the keyboard.',
        'floating letter shapes, a transform-arrow icon, a small checkmark, and a keyboard silhouette',
      ),
      prompt(
        'A traveler types a search query with mixed Turkish characters on a phone, a soft glowing checkmark confirming the correct place appears despite spelling variation.',
        'a search-bar shape, a checkmark, floating letter symbols, and a magnifying glass',
      ),
    ],
    linkedinPost: `🔤 "Kahvalti" da yazsan, "kahvaltı" da — fark etmez.

Kaş Guide'ın arama altyapısı Türkçe karakter normalizasyonu içerir: ğ, ü, ş, ı, ö, ç varyasyonları doğru şekilde eşleşir.

Küçük bir detay, büyük bir kullanım kolaylığı. ⌨️

👉 kasguide.com

#KaşGuide #TeknikDetay #Kaş #Yazılım`,
  },
  {
    id: 'post-35',
    order: 35,
    category: 'ozellik',
    title: 'Admin Panel Yönetimi',
    imagePrompts: [
      prompt(
        'An admin sits at a clean dashboard interface managing places, news and announcements from a single control panel, soft glowing module icons arranged neatly on the desk beside the laptop.',
        'a dashboard-grid icon, a small gear icon, a checklist, and a folder shape',
      ),
      prompt(
        'A small content team reviews a list of pending place submissions together at a shared table, laptop screen showing a clean review queue between them.',
        'a review-queue list icon, a checkmark, a small gear, and a stack of cards',
      ),
    ],
    linkedinPost: `⚙️ Perde arkasında sağlam bir yönetim sistemi var.

Kaş Guide'ın admin paneli; mekanlar, hero slider, haberler/duyurular ve scraper'lar için ayrı ama entegre yönetim ekranları sunuyor.

İyi bir kullanıcı deneyimi, iyi bir yönetim altyapısıyla mümkün. 🧩

👉 kasguide.com

#KaşGuide #AdminPanel #ÜrünGeliştirme #Kaş`,
  },
  {
    id: 'post-36',
    order: 36,
    category: 'ozellik',
    title: 'İçerik Onay Süreci (Review Queue)',
    imagePrompts: [
      prompt(
        'An editor carefully reviews a draft place listing on a large monitor, comparing submitted photos and details before approving it, soft office lighting.',
        'a review-queue icon, a magnifying glass, a checkmark, and a small stack of draft cards',
      ),
      prompt(
        'Two team members discuss a place submission on a tablet screen together, pointing at details before marking it approved.',
        'a checklist icon, a small approval-stamp shape, a magnifying glass, and a document card',
      ),
    ],
    linkedinPost: `🔎 Yayınlanmadan önce her mekan bir gözden geçiriliyor.

pending → review → admin → published sürecinde her kayıt, yayınlanmadan önce ekibimizin incelemesinden geçiyor.

Hız önemli, ama doğruluk daha önemli. ✔️

👉 kasguide.com

#KaşGuide #KaliteKontrol #Kaş #İçerikYönetimi`,
  },
  {
    id: 'post-37',
    order: 37,
    category: 'ozellik',
    title: 'SEO Odaklı Tematik Sayfalar',
    imagePrompts: [
      prompt(
        'A traveler searches online and lands directly on a beautifully organized themed guide page about Kaş beaches, phone glowing softly with a clean article layout.',
        'a search-result card, a magnifying glass, a small beach-umbrella icon, and a location pin',
      ),
      prompt(
        'A content strategist reviews a set of themed landing page thumbnails (beaches, diving, nightlife, hotels) spread across a desk like a mood board.',
        'a small stack of thumbnail cards, a magnifying glass, and a checkmark',
      ),
    ],
    linkedinPost: `🌐 Google'da arayınca doğrudan doğru sayfaya düş.

Kaş Guide; "kaş en güzel plajlar", "kaş dalış noktaları", "kaş gece hayatı" gibi konulara özel, derinlemesine hazırlanmış rehber sayfaları sunuyor.

Rastgele blog değil, gerçek bir rehber. 📖

👉 kasguide.com

#KaşGuide #SEO #İçerikStratejisi #Kaş`,
  },
  {
    id: 'post-38',
    order: 38,
    category: 'ozellik',
    title: 'Yazı Dizileri (Editoryal İçerik)',
    imagePrompts: [
      prompt(
        'A writer flips through a series of connected article drafts pinned to a corkboard in a cozy home office, Kaş photographs scattered among the pages.',
        'a corkboard-pin shape, a connecting string line, a small notebook, and a photo card',
      ),
      prompt(
        'A reader scrolls through a multi-part article series on a tablet while relaxing in a hammock, small chapter-marker icons visible in the progress bar.',
        'a chapter-marker icon, a progress-bar shape, an open book, and a small leaf',
      ),
    ],
    linkedinPost: `📚 Tek yazı değil, bir seri.

"Yazı Dizileri" bölümü; Kaş hakkında derinlemesine, çok parçalı editoryal içerikleri bir araya getiriyor. Bir konuyu gerçekten anlamak isteyenler için.

Hızlı okuma değil, kalıcı bilgi. 🔖

👉 kasguide.com/yazi-dizileri

#KaşGuide #İçerik #EditoryalSeri #Kaş`,
  },

  // ————————————————————————————————————————————————————————————
  // REHBER SAYFALARI (39-47) — src/app/kas-*/page.tsx tematik landing sayfaları
  // ————————————————————————————————————————————————————————————
  {
    id: 'post-39',
    order: 39,
    category: 'sayfa',
    title: 'Kaş En Güzel Plajlar Rehberi',
    imagePrompts: [
      prompt(
        'A family walks down a wooden staircase toward Kaputaş beach, dramatic cliff walls on either side framing the bright turquoise water below.',
        'a staircase shape, a wave line, a beach umbrella, and a cliff silhouette',
      ),
      prompt(
        'A traveler compares a shortlist of beach photos on their phone while sitting on a rocky outcrop overlooking a hidden cove near Kaş.',
        'a photo-stack shape, a checklist icon, a wave line, and a small compass',
      ),
    ],
    linkedinPost: `🏖️ Kaş'ın en güzel 10 plajı, tek sayfada.

Kaputaş'tan Büyük Çakıl'a, Akçagerme'den az bilinen gizli koylara kadar — detaylı bir rehber hazırladık.

Hangi plaj sana göre, gitmeden önce öğren. 🌊

👉 kasguide.com/kas-en-guzel-plajlar

#KaşGuide #Kaputaş #Plaj #Kaş`,
  },
  {
    id: 'post-40',
    order: 40,
    category: 'sayfa',
    title: 'Kaş Merkez Gezilecek Yerler Rehberi',
    imagePrompts: [
      prompt(
        'A traveler walks through the narrow whitewashed streets of central Kaş, bougainvillea draping over stone walls, the harbor visible at the end of the street.',
        'a bougainvillea flower, a narrow-street outline, a location pin, and a small harbor silhouette',
      ),
      prompt(
        'A small group takes a photo together in the main square of Kaş center, ancient ruins and the harbor visible in the soft afternoon light behind them.',
        'a camera icon, a small square-plaza shape, an ancient column, and a sun icon',
      ),
    ],
    linkedinPost: `🚶 Kaş merkezde bir günü nasıl geçirirsin?

Antik kalıntılardan liman meydanına, dar sokaklardan manzara noktalarına kadar merkez Kaş'ın görülmesi gereken her yerini derledik.

Az zamanda çok şey görmek isteyenler için ideal rehber. 🗺️

👉 kasguide.com/kas-merkez-gezilecek-yerler

#KaşGuide #KaşMerkez #Gezi #Kaş`,
  },
  {
    id: 'post-41',
    order: 41,
    category: 'sayfa',
    title: 'Kaş Tatil Rehberi',
    imagePrompts: [
      prompt(
        'A family spreads out a travel itinerary on a hotel room bed overlooking the Kaş coastline, sunglasses and travel guides scattered nearby.',
        'a folded map shape, a suitcase icon, a small itinerary-card, and a sun icon',
      ),
      prompt(
        'A couple sits on a balcony planning their upcoming days in Kaş, laptop open showing a comprehensive travel guide, sea view behind them.',
        'a laptop silhouette, a checklist icon, a small calendar, and a location pin',
      ),
    ],
    linkedinPost: `🧳 Kaş'a ilk kez mi gidiyorsun?

Nereden başlanır, ne zaman gidilir, ne kadar bütçe ayrılır, nerede kalınır — kapsamlı Kaş Tatil Rehberi tüm bu soruları cevaplıyor.

Planlamayı bize bırak, sen tatile odaklan. 🌴

👉 kasguide.com/kas-tatil-rehberi

#KaşGuide #TatilRehberi #Kaş #SeyahatPlanı`,
  },
  {
    id: 'post-42',
    order: 42,
    category: 'sayfa',
    title: 'Kaş Yapılacak Aktiviteler Rehberi',
    imagePrompts: [
      prompt(
        'A group of friends prepares for a paragliding launch on a hillside above Kaş, the coastline and sea spread out dramatically below them.',
        'a paraglider wing shape, a mountain silhouette, a small compass, and a wave line',
      ),
      prompt(
        'A traveler rents a kayak at a small waterfront stand in Kaş, paddle in hand, turquoise water and boats visible behind them.',
        'a kayak-paddle shape, a wave line, a small life-vest icon, and a sun icon',
      ),
    ],
    linkedinPost: `⚡ Kaş'ta sıkılmaya vakit yok.

Yamaç paraşütünden kayağa, dalıştan tekne turlarına kadar Kaş'ta yapabileceğin tüm aktiviteleri tek rehberde topladık.

Enerjini nasıl harcayacağını seç, gerisi kolay. 🪂

👉 kasguide.com/kas-yapilacak-aktiviteler

#KaşGuide #Aktivite #Macera #Kaş`,
  },
  {
    id: 'post-43',
    order: 43,
    category: 'sayfa',
    title: 'Kaş Nerede Ne Yenir Rehberi',
    imagePrompts: [
      prompt(
        'A traveler samples a variety of small local dishes at a long table set with regional Kaş specialties, warm restaurant lighting around them.',
        'a plated dish icon, a fork-and-knife, a small herb sprig, and a steam curl',
      ),
      prompt(
        'A local guide points out a signature seafood dish to a curious visitor at a waterfront restaurant counter in Kaş.',
        'a fish icon, a plated-dish shape, a small pointing-hand gesture, and a steam curl',
      ),
    ],
    linkedinPost: `🍽️ Kaş'ta yemek seçimi kafa karıştırmasın.

Hangi mekanda ne yenir, yöresel lezzetler nerede bulunur — "Nerede Ne Yenir" rehberimiz bu soruları net cevaplarla yanıtlıyor.

Tahmin etmek yerine bilerek sipariş ver. 😋

👉 kasguide.com/kas-nerede-ne-yenir

#KaşGuide #YerelLezzet #Gastronomi #Kaş`,
  },
  {
    id: 'post-44',
    order: 44,
    category: 'sayfa',
    title: 'Kaş Tekne Turu Rehberi',
    imagePrompts: [
      prompt(
        'A group of friends relaxes on the deck of a wooden gulet boat sailing along the dramatic Kaş coastline, turquoise water and hidden coves passing by.',
        'a sailboat silhouette, a wave line, a small anchor icon, and a sun icon',
      ),
      prompt(
        'A traveler jumps off the side of a boat into clear turquoise water near a secluded Kaş cove, splash forming around them mid-air.',
        'a splash shape, a boat silhouette, a wave line, and a small fish icon',
      ),
    ],
    linkedinPost: `⛵ Kaş'ı en iyi denizden görürsün.

Gulet turlarından günlük tekne gezilerine kadar, Kaş'taki tekne turu seçeneklerini karşılaştırmalı olarak derledik.

Hangi rota, hangi süre, hangi bütçe — hepsi tek sayfada. 🌊

👉 kasguide.com/kas-tekne-turu

#KaşGuide #TekneTuru #Kaş #Akdeniz`,
  },
  {
    id: 'post-45',
    order: 45,
    category: 'sayfa',
    title: 'Kaş Dalış Noktaları Rehberi',
    imagePrompts: [
      prompt(
        'A diver hovers near a colorful underwater reef off the Kaş coast, sunlight filtering down through the clear blue water above them.',
        'a diving mask, a coral-reef shape, a sunray, and a small fish school',
      ),
      prompt(
        'A group of divers compares dive-site maps on a boat deck before entering the water near a well-known Kaş diving point.',
        'a dive-site map icon, an oxygen tank, a compass, and a wave line',
      ),
    ],
    linkedinPost: `🤿 Akdeniz'in en iyi dalış noktalarından biri: Kaş.

Batık gemi kalıntılarından mağara diplerine kadar, Kaş'ın en iyi dalış noktalarını seviyelerine göre listeledik.

Yeni başlayan da, deneyimli dalgıç da kendine uygununu bulur. 🐠

👉 kasguide.com/kas-dalis-noktalari

#KaşGuide #Dalış #ScubaDiving #Kaş`,
  },
  {
    id: 'post-46',
    order: 46,
    category: 'sayfa',
    title: 'Kaş Otel Önerileri Rehberi',
    imagePrompts: [
      prompt(
        'A traveler stands on a hotel terrace comparing a shortlist on their phone, several boutique hotel facades visible along the Kaş hillside behind them.',
        'a hotel-bed icon, a comparison-checklist, a small key icon, and a location pin',
      ),
      prompt(
        'A couple checks into a small boutique hotel with a sea view in Kaş, warm welcoming light from the reception desk.',
        'a key icon, a small suitcase, a welcome-mat shape, and a sun icon',
      ),
    ],
    linkedinPost: `🛏️ Bütçene ve tarzına uygun otel nasıl bulunur?

Butik pansiyonlardan konforlu otellere, aile işletmelerinden deniz manzaralı tesislere kadar Kaş'taki en iyi konaklama seçeneklerini karşılaştırdık.

Rezervasyon yapmadan önce oku. 📋

👉 kasguide.com/kas-otel-onerileri

#KaşGuide #Otel #Konaklama #Kaş`,
  },
  {
    id: 'post-47',
    order: 47,
    category: 'sayfa',
    title: 'Kaş Gece Hayatı Rehberi',
    imagePrompts: [
      prompt(
        'A group of friends walks along a lively harbor promenade in Kaş at night, warm string lights and glowing bar terraces lining the water\'s edge.',
        'a string-light garland, a cocktail glass, a small music-note icon, and a crescent moon',
      ),
      prompt(
        'A live musician performs on a small stage at an open-air Kaş bar terrace at night, a relaxed crowd enjoying drinks under string lights.',
        'a guitar silhouette, a music-note icon, a string-light garland, and a small stage-spotlight',
      ),
    ],
    linkedinPost: `🌙 Kaş'ta gece de gündüz kadar canlı.

Liman kenarındaki barlardan canlı müzik mekanlarına, sakin şarap teraslarına kadar Kaş'ın gece hayatını tek rehberde topladık.

Sakin bir akşam mı, canlı bir gece mi — sen seç. 🎶

👉 kasguide.com/kas-gece-hayati

#KaşGuide #GeceHayatı #Kaş #Eğlence`,
  },

  // ————————————————————————————————————————————————————————————
  // MARKA / TOPLULUK (48-50)
  // ————————————————————————————————————————————————————————————
  {
    id: 'post-48',
    order: 48,
    category: 'marka',
    title: 'Kaş Köyleri Keşfi',
    imagePrompts: [
      prompt(
        'A traveler walks through a quiet stone village near Kaş, terraced hillsides and olive trees surrounding traditional houses, an elderly local waving warmly from a doorway.',
        'an olive branch, a stone-house silhouette, a small terraced-hill shape, and a sun icon',
      ),
      prompt(
        'A small group shares a simple village meal at an outdoor table surrounded by orchards near a Kaş village, mountains visible in the distance.',
        'a fruit-basket icon, a small table-setting shape, a mountain silhouette, and a leaf',
      ),
    ],
    linkedinPost: `🏘️ Kaş'ın çevresindeki köyler de keşfedilmeyi bekliyor.

Sakin dağ köylerinden zeytin bahçeleriyle çevrili yerleşimlere kadar, Kaş'ın çevresindeki köy rotalarını da rehberimize ekledik.

Şehrin telaşından uzaklaşmak isteyenlere. 🌄

👉 kasguide.com/kas-koyleri

#KaşGuide #KaşKöyleri #YavaşTurizm #Kaş`,
  },
  {
    id: 'post-49',
    order: 49,
    category: 'marka',
    title: 'Sıkça Sorulan Sorular (FAQ)',
    imagePrompts: [
      prompt(
        'A traveler reads through a clean list of frequently asked questions on their phone while waiting at a small Kaş bus stop, calm and reassured expression.',
        'a question-mark bubble, a checklist icon, a small bus-stop shape, and a location pin',
      ),
      prompt(
        'A family discusses trip logistics around a cafe table, one person pointing at an FAQ answer on a tablet screen, Kaş harbor visible outside the window.',
        'a question-mark bubble, a checkmark, a small info-card, and a coffee cup',
      ),
    ],
    linkedinPost: `❓ Aklındaki soru muhtemelen daha önce soruldu.

Ulaşım, mevsim, bütçe, güvenlik — Kaş hakkında en çok merak edilen soruların net, doğrulanmış cevaplarını FAQ sayfamızda bulabilirsin.

Belirsizlikle değil, bilgiyle yola çık. 📋

👉 kasguide.com/faq

#KaşGuide #SSS #SeyahatRehberi #Kaş`,
  },
  {
    id: 'post-50',
    order: 50,
    category: 'marka',
    title: 'Kaş Guide Marka Vizyonu',
    imagePrompts: [
      prompt(
        'A diverse small group of locals and travelers stand together at a scenic Kaş viewpoint at golden hour, looking out over the town, harbor and sea with a sense of shared discovery.',
        'a compass, a small heart-shaped location pin, a sun icon, and a wave line',
      ),
      prompt(
        'A local guide and a traveler shake hands warmly at the entrance of a small Kaş shop, genuine connection in the moment, sea and rooftops visible behind them.',
        'a handshake shape, a small heart icon, a location pin, and a sun icon',
      ),
    ],
    linkedinPost: `🌊 Kaş Guide, sadece bir liste değil.

Doğrulanmış mekanlar, gerçek yerel sesler, güncel bilgi ve topluluk katkısıyla büyüyen kapsamlı bir şehir rehberi.

Amacımız basit: Kaş'ı en doğru, en samimi şekilde anlatmak.

Sen de bir mekan biliyorsan, bize katıl. 🤝

👉 kasguide.com

#KaşGuide #Vizyon #Kaş #Antalya #ŞehirRehberi`,
  },
]

export function getSocialPostById(id: string): SocialLinkedinPost | undefined {
  return SOCIAL_LINKEDIN_POSTS.find((post) => post.id === id)
}
