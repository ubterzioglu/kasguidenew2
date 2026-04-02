-- Seed Badges
-- Based on badgeDefinitions from places-data.js

INSERT INTO badges (slug, emoji, title, description) VALUES
('tourist', '🎒', 'Turist Dostu', 'İlk kez gelenler için anlaşılır, rahat ve pratik bir tercih.'),
('recommend', '⭐', 'Kaş Guide Önerir', 'Kaş Guide ekibinin net önerisi.'),
('localFav', '❤️', 'Yerel Favori', 'Kaşlıların sık gittiği, sevdiği yer.'),
('classic', '🏛️', 'Kaş Klasiği', 'Yıllardır bilinen, adı oturmuş klasik durak.'),
('newFind', '🌱', 'Yeni Keşif', 'Yeni açılan/yeniden parlayan, keşiflik yer.'),
('editorsPick', '🖊️', 'Editör Seçimi', 'Detaylarıyla öne çıkan, seçilmiş deneyim.'),
('surprise', '🎯', 'Sürpriz Nokta', 'Beklenenden iyi çıkan, hoş sürpriz.'),
('hidden', '👀', 'Gizli Kalmış', 'Çok bilinmeyen ama değerli bir köşe.'),
('again', '🔁', 'Tekrar Gidilir', 'Bir kez gidince listede kalan yer.'),
('kasSoul', '🌊', 'Kaş Ruhu Var', 'Kaş''ın o rahat, gerçek hissini veren yer.'),
('firstTimers', '🧭', 'İlk Kez Gelenlere Uygun', 'Kaş''a ilk gelişte risksiz, net tercih.'),
('timeless', '🕰️', 'Yıllardır Değişmeyen', 'İstikrarı ve çizgisiyle güven veren.'),
('chattyOwner', '🤝', 'Sahibiyle Muhabbetlik', 'Sıcakkanlı, iletişimi güçlü işletme hissi.'),
('sunsetStart', '🌅', 'Akşam Başlangıcı', 'Gün batımı sonrası akşamı başlatmalık.'),
('nightCarrier', '🌙', 'Geceyi Taşıyan Mekân', 'Gece ilerledikçe temposu yükselen durak.'),
('must', '💎', 'Kaş''ta Olmazsa Olmaz', 'Kaş deneyiminin imza duraklarından.')
ON CONFLICT (slug) DO NOTHING;
