-- Insert first interview: Sabiha Gökçen - Gökyüzü Meyhanesi
-- Type: interview in unified items system

INSERT INTO items (
  item_number,
  item_type,
  slug,
  title,
  description,
  long_text,
  photos,
  attributes,
  status,
  published_at,
  created_at,
  updated_at
)
VALUES (
  'INTERVIEW-001',
  'interview',
  'sabiha-gokcen-gokyuzu-meyhanesi',
  'Sabiha Gökçen - Gökyüzü Meyhanesi',
  'Gökyüzü Meyhanesi''nin sahibi Sabiha Gökçen ile Kaş''ta yaşam, işletmecilik ve turizm üzerine keyifli bir söyleşi.',
  '**Kaş Guide:** Kendinizi 5 kısa cümleyle tanıtır mısınız?

**Sabiha Gökçen:** Ben Sabiha, Gökyüzü Meyhanesi''nin kurucusuyum. 15 yıldır Kaş''tayım ve bu güzel kasabayı yuvam bildim. Misafirperverlik benim tutkum, insanları bir araya getirmek en büyük mutluluğum. Deniz kenarında, yıldızların altında sofra kurmayı çok severim. Kaş''ın ruhunu meyhanemin her köşesine yansıtmaya çalışıyorum.

**Kaş Guide:** Neden Kaş?

**Sabiha Gökçen:** Kaş beni buldu aslında, ben onu bulmadım. Yıllar önce bir tatil için gelmiştim, ama bu kasabanın sihri beni hiç bırakmadı. Denizin mavisi, dağların yeşili, insanların samimiyeti... Her şey burada çok farklı. Kaş''ta yaşamak sadece bir yer değiştirmek değil, hayat tarzı değiştirmek demek. Burada zaman farklı akar, insan kendini bulur.

**Kaş Guide:** Kaş''ta en sevdiğiniz mevsim hangisi? Neden?

**Sabiha Gökçen:** Sonbaharı çok severim. Yaz kalabalığı dinmiştir, hava hala sıcaktır, deniz ılık. O dönem Kaş asıl yüzünü gösterir. Yerel halkla daha çok vakit geçirirsiniz, sokaklar sakinleşir, güneş batımları daha bir güzel olur. Sonbaharda meyhanede kurulan sofralar da bir başka oluyor, daha içten, daha samimi.

**Kaş Guide:** Kaş''ta yapmayı en çok sevdiğiniz şey nedir?

**Sabiha Gökçen:** Sabah erkenden sahilde yürüyüş yapmak ve balıkçılarla sohbet etmek. Onların getirdiği taze balıkları seçmek, o günün menüsünü ona göre planlamak... Bu benim için ritüeldir. Akşam da misafirlerimle uzun sohbetler etmek, onların hikayelerini dinlemek en büyük zevkim. Her masada yeni bir hikaye, yeni bir dostluk doğuyor.

**Kaş Guide:** İşletmeniz, misafirlerine 5 kısa cümleyle ne vadediyor?

**Sabiha Gökçen:** Gökyüzü Meyhanesi''nde size sadece yemek değil, deneyim sunuyoruz. Taze balıklarımız her sabah Kaş limanından gelir. Mezelerimiz annemin tarifleriyle, ev yapımıdır. Müzik, deniz manzarası ve samimi atmosferle unutulmaz anlar yaşarsınız. Burası sadece bir meyhane değil, bir yuva, bir aile sofrası.',
  '[
    {
      "url": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=70",
      "sequence": 0,
      "is_primary": true,
      "type": "banner",
      "caption": "Gökyüzü Meyhanesi banner"
    },
    {
      "url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=70",
      "sequence": 1,
      "type": "profile",
      "caption": "Sabiha Gökçen profil fotoğrafı"
    }
  ]'::jsonb,
  '{
    "interviewee": "Sabiha Gökçen",
    "business": "Gökyüzü Meyhanesi",
    "interviewer": "Kaş Guide",
    "date": "2024-12-15",
    "tags": ["röportaj", "meyhane", "işletmeci", "kaş yaşam", "söyleşi"]
  }'::jsonb,
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
