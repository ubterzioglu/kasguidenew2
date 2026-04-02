#!/usr/bin/env node
/**
 * Data Import Script
 * Imports existing data from JS files into PostgreSQL database
 *
 * Usage:
 *   node db/import-data.js [entity]
 *
 * Examples:
 *   node db/import-data.js         - Import all entities
 *   node db/import-data.js places  - Import places only
 *   node db/import-data.js hotels  - Import hotels only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Generate slug from title
 * @param {string} title
 * @returns {string}
 */
function generateSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get badge ID from slug
 * @param {string} badgeSlug
 * @returns {Promise<number|null>}
 */
async function getBadgeId(badgeSlug) {
  if (!badgeSlug) return null;
  try {
    const result = await sql`SELECT id FROM badges WHERE slug = ${badgeSlug}`;
    return result.rows[0]?.id || null;
  } catch (error) {
    console.warn(`Warning: Badge '${badgeSlug}' not found`);
    return null;
  }
}

/**
 * Get category ID from slug
 * @param {string} categorySlug
 * @returns {Promise<number|null>}
 */
async function getCategoryId(categorySlug) {
  if (!categorySlug) return null;
  try {
    const result = await sql`SELECT id FROM categories WHERE slug = ${categorySlug}`;
    return result.rows[0]?.id || null;
  } catch (error) {
    console.warn(`Warning: Category '${categorySlug}' not found`);
    return null;
  }
}

/**
 * Import Places from places-data.js
 */
async function importPlaces() {
  console.log('\n📍 Importing Places...');

  const dataPath = path.join(projectRoot, 'places', 'places-data.js');

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  places-data.js not found, skipping...');
    return;
  }

  // Read and parse the file (simple extraction of allPlaces array)
  const fileContent = fs.readFileSync(dataPath, 'utf8');

  // Extract the array using regex (assuming const allPlaces = [...])
  const match = fileContent.match(/const\s+allPlaces\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    console.error('❌ Could not parse allPlaces from places-data.js');
    return;
  }

  let allPlaces;
  try {
    // Use eval in a controlled way (we trust our own data file)
    allPlaces = eval(match[1]);
  } catch (error) {
    console.error('❌ Error parsing places data:', error.message);
    return;
  }

  console.log(`   Found ${allPlaces.length} places to import`);

  let imported = 0;
  let skipped = 0;

  for (const place of allPlaces) {
    try {
      // Generate slug if not present
      const slug = place.id || generateSlug(place.title);

      // Check if already exists
      const existing = await sql`SELECT id FROM places WHERE slug = ${slug}`;
      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Skipping '${place.title}' (already exists)`);
        skipped++;
        continue;
      }

      // Get badge ID
      const badgeId = await getBadgeId(place.badgeId);

      // Insert place
      const result = await sql`
        INSERT INTO places (
          slug, title, description, long_text, badge_id,
          rating, price, selected,
          location, distance, coordinates_lat, coordinates_lng,
          primary_image, duration, access_info,
          phone, website, instagram, booking_url, google_maps_query,
          verified, info_date, disclaimer,
          status, published_at
        ) VALUES (
          ${slug},
          ${place.title || ''},
          ${place.description || null},
          ${place.longText || ''},
          ${badgeId},
          ${place.rating || null},
          ${place.price || null},
          ${place.selected || false},
          ${place.location || null},
          ${place.distance || null},
          ${place.coordinates?.lat || null},
          ${place.coordinates?.lng || null},
          ${place.image || null},
          ${place.duration || null},
          ${place.access || null},
          ${place.phone || null},
          ${place.website || null},
          ${place.instagram || null},
          ${place.booking || null},
          ${place.googleMapsQuery || null},
          ${place.trust?.verified || false},
          ${place.trust?.infoDate || null},
          ${place.trust?.disclaimer !== false},
          'approved',
          NOW()
        ) RETURNING id
      `;

      const placeId = result.rows[0].id;

      // Insert images
      if (place.images && Array.isArray(place.images)) {
        for (let i = 0; i < place.images.length; i++) {
          await sql`
            INSERT INTO place_images (place_id, image_url, sequence_order)
            VALUES (${placeId}, ${place.images[i]}, ${i})
          `;
        }
      }

      // Insert categories
      if (place.category && Array.isArray(place.category)) {
        for (const catSlug of place.category) {
          const categoryId = await getCategoryId(catSlug);
          if (categoryId) {
            await sql`
              INSERT INTO place_categories (place_id, category_id)
              VALUES (${placeId}, ${categoryId})
            `;
          }
        }
      }

      // Insert facilities
      if (place.facilities && Array.isArray(place.facilities)) {
        for (const facility of place.facilities) {
          await sql`
            INSERT INTO place_facilities (place_id, facility_name)
            VALUES (${placeId}, ${facility})
          `;
        }
      }

      // Insert features
      if (place.features && Array.isArray(place.features)) {
        for (const feature of place.features) {
          await sql`
            INSERT INTO place_features (place_id, feature_text)
            VALUES (${placeId}, ${feature})
          `;
        }
      }

      // Insert tags
      if (place.tags && Array.isArray(place.tags)) {
        for (const tag of place.tags) {
          await sql`
            INSERT INTO place_tags (place_id, tag_name)
            VALUES (${placeId}, ${tag})
          `;
        }
      }

      console.log(`   ✅ Imported: ${place.title}`);
      imported++;

    } catch (error) {
      console.error(`   ❌ Error importing '${place.title}':`, error.message);
    }
  }

  console.log(`\n   📊 Results: ${imported} imported, ${skipped} skipped\n`);
}

/**
 * Import Hotels from hotels-data.js
 */
async function importHotels() {
  console.log('\n🏨 Importing Hotels...');

  const dataPath = path.join(projectRoot, 'hotel', 'hotels-data.js');

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  hotels-data.js not found, skipping...');
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf8');
  const match = fileContent.match(/const\s+allHotels\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    console.log('⚠️  Could not parse allHotels from hotels-data.js, skipping...');
    return;
  }

  let allHotels;
  try {
    allHotels = eval(match[1]);
  } catch (error) {
    console.error('❌ Error parsing hotels data:', error.message);
    return;
  }

  console.log(`   Found ${allHotels.length} hotels to import`);

  let imported = 0;
  let skipped = 0;

  for (const hotel of allHotels) {
    try {
      const slug = hotel.id || generateSlug(hotel.title);

      // Check if exists
      const existing = await sql`SELECT id FROM hotels WHERE slug = ${slug}`;
      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Skipping '${hotel.title}' (already exists)`);
        skipped++;
        continue;
      }

      // Insert hotel
      const result = await sql`
        INSERT INTO hotels (
          slug, title, hotel_type, star_rating, room_count, capacity,
          location, distance_to_sea, coordinates_lat, coordinates_lng,
          description, long_text, primary_image,
          price_range, checkin_time, checkout_time,
          phone, email, website, instagram, booking_url, google_maps_query,
          rating, review_count,
          verified, info_date, disclaimer,
          status, published_at
        ) VALUES (
          ${slug},
          ${hotel.title || ''},
          ${hotel.hotelType || 'butik'},
          ${hotel.starRating || null},
          ${hotel.roomCount || null},
          ${hotel.capacity || null},
          ${hotel.location || ''},
          ${hotel.distanceToSea || null},
          ${hotel.coordinates?.lat || null},
          ${hotel.coordinates?.lng || null},
          ${hotel.description || ''},
          ${hotel.longText || ''},
          ${hotel.image || null},
          ${hotel.priceRange || null},
          ${hotel.checkinTime || null},
          ${hotel.checkoutTime || null},
          ${hotel.phone || ''},
          ${hotel.email || ''},
          ${hotel.website || null},
          ${hotel.instagram || null},
          ${hotel.booking || null},
          ${hotel.googleMapsQuery || null},
          ${hotel.rating || null},
          ${hotel.reviewCount || 0},
          ${hotel.trust?.verified || false},
          ${hotel.trust?.infoDate || null},
          ${hotel.trust?.disclaimer !== false},
          'approved',
          NOW()
        ) RETURNING id
      `;

      const hotelId = result.rows[0].id;

      // Insert images
      if (hotel.images && Array.isArray(hotel.images)) {
        for (let i = 0; i < hotel.images.length; i++) {
          await sql`
            INSERT INTO hotel_images (hotel_id, image_url, sequence_order)
            VALUES (${hotelId}, ${hotel.images[i]}, ${i})
          `;
        }
      }

      // Insert facilities
      if (hotel.facilities && Array.isArray(hotel.facilities)) {
        for (const facility of hotel.facilities) {
          await sql`
            INSERT INTO hotel_facilities (hotel_id, facility_name)
            VALUES (${hotelId}, ${facility})
          `;
        }
      }

      // Insert tags
      if (hotel.tags && Array.isArray(hotel.tags)) {
        for (const tag of hotel.tags) {
          await sql`
            INSERT INTO hotel_tags (hotel_id, tag_name)
            VALUES (${hotelId}, ${tag})
          `;
        }
      }

      console.log(`   ✅ Imported: ${hotel.title}`);
      imported++;

    } catch (error) {
      console.error(`   ❌ Error importing '${hotel.title}':`, error.message);
    }
  }

  console.log(`\n   📊 Results: ${imported} imported, ${skipped} skipped\n`);
}

/**
 * Import FAQs from faq-list-data.js
 */
async function importFAQs() {
  console.log('\n❓ Importing FAQs...');

  const dataPath = path.join(projectRoot, 'faq', 'faq-list-data.js');

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  faq-list-data.js not found, skipping...');
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf8');

  // Extract the array - handle both inline and newline formats
  let match = fileContent.match(/window\.faqData\s*=\s*(\[[\s\S]*$)/m);

  if (!match) {
    console.log('⚠️  Could not parse faqData, skipping...');
    return;
  }

  // Extract just the array part (everything after the =)
  let arrayText = match[1].trim();

  let faqData;
  try {
    faqData = eval(arrayText);
  } catch (error) {
    console.error('❌ Error parsing FAQ data:', error.message);
    return;
  }

  console.log(`   Found ${faqData.length} FAQs to import`);

  let imported = 0;

  for (let i = 0; i < faqData.length; i++) {
    const faq = faqData[i];
    try {
      await sql`
        INSERT INTO faqs (question, answer, sequence_order, is_published)
        VALUES (${faq.question}, ${faq.answer}, ${i}, true)
      `;
      imported++;
    } catch (error) {
      console.error(`   ❌ Error importing FAQ:`, error.message);
    }
  }

  console.log(`\n   📊 Results: ${imported} imported\n`);
}

/**
 * Import Pets from pet-data.js
 */
async function importPets() {
  console.log('\n🐾 Importing Pets...');

  const dataPath = path.join(projectRoot, 'pet', 'pet-data.js');

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  pet-data.js not found, skipping...');
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf8');
  const match = fileContent.match(/const\s+pets\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    console.log('⚠️  Could not parse pets from pet-data.js, skipping...');
    return;
  }

  let pets;
  try {
    pets = eval(match[1]);
  } catch (error) {
    console.error('❌ Error parsing pets data:', error.message);
    return;
  }

  console.log(`   Found ${pets.length} pets to import`);

  let imported = 0;

  for (const pet of pets) {
    try {
      // Insert pet
      const result = await sql`
        INSERT INTO pets (
          listing_type, pet_name, pet_type, age, breed,
          short_note, extra_notes, phone, status
        ) VALUES (
          'bulundu',
          ${pet.id || ''},
          ${pet.type || ''},
          ${pet.age || ''},
          ${pet.breed || ''},
          ${pet.shortNote || ''},
          ${pet.extraNotes || ''},
          'Bilinmiyor',
          'active'
        ) RETURNING id
      `;

      const petId = result.rows[0].id;

      // Insert photos
      if (pet.photos && Array.isArray(pet.photos)) {
        for (const photo of pet.photos) {
          await sql`
            INSERT INTO pet_photos (pet_id, photo_url)
            VALUES (${petId}, ${photo})
          `;
        }
      }

      console.log(`   ✅ Imported: ${pet.type} - ${pet.breed}`);
      imported++;

    } catch (error) {
      console.error(`   ❌ Error importing pet '${pet.id}':`, error.message);
    }
  }

  console.log(`\n   📊 Results: ${imported} imported\n`);
}

/**
 * Import Articles from articles-data.js
 */
async function importArticles() {
  console.log('\n📝 Importing Articles...');

  const dataPath = path.join(projectRoot, 'articles', 'articles-data.js');

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  articles-data.js not found, skipping...');
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf8');
  const match = fileContent.match(/const\s+articles\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    console.log('⚠️  Could not parse articles from articles-data.js, skipping...');
    return;
  }

  let articles;
  try {
    articles = eval(match[1]);
  } catch (error) {
    console.error('❌ Error parsing articles data:', error.message);
    return;
  }

  console.log(`   Found ${articles.length} articles to import`);

  let imported = 0;

  for (const article of articles) {
    try {
      const slug = article.id || generateSlug(article.title);

      // Check if already exists
      const existing = await sql`SELECT id FROM articles WHERE slug = ${slug}`;
      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Skipping '${article.title}' (already exists)`);
        continue;
      }

      // Insert article
      const result = await sql`
        INSERT INTO articles (
          slug, title, description, content,
          author, read_time, featured_image,
          status, published_at
        ) VALUES (
          ${slug},
          ${article.title || ''},
          ${article.description || ''},
          ${article.longText || ''},
          ${article.author || 'Kaş Guide'},
          ${article.readTime || ''},
          ${article.image || null},
          'published',
          NOW()
        ) RETURNING id
      `;

      const articleId = result.rows[0].id;

      // Insert tags
      if (article.tags && Array.isArray(article.tags)) {
        for (const tag of article.tags) {
          await sql`
            INSERT INTO article_tags (article_id, tag_name)
            VALUES (${articleId}, ${tag})
          `;
        }
      }

      console.log(`   ✅ Imported: ${article.title}`);
      imported++;

    } catch (error) {
      console.error(`   ❌ Error importing article '${article.title}':`, error.message);
    }
  }

  console.log(`\n   📊 Results: ${imported} imported\n`);
}

/**
 * Import FAQ Series from faqspecial-data.js
 */
async function importFaqSeries() {
  console.log('\n❓ Importing FAQ Series...');

  const dataPath = path.join(projectRoot, 'faqspecial', 'faqspecial-data.js');

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  faqspecial-data.js not found, skipping...');
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf8');
  const match = fileContent.match(/const\s+faqspecialSeries\s*=\s*(\[[\s\S]*?\]);/);

  if (!match) {
    console.log('⚠️  Could not parse faqspecialSeries from faqspecial-data.js, skipping...');
    return;
  }

  let faqSeries;
  try {
    faqSeries = eval(match[1]);
  } catch (error) {
    console.error('❌ Error parsing faqspecial data:', error.message);
    return;
  }

  console.log(`   Found ${faqSeries.length} faq series to import`);

  let imported = 0;

  for (const faq of faqSeries) {
    try {
      const slug = faq.id || generateSlug(faq.title);

      // Check if already exists
      const existing = await sql`SELECT id FROM faq_series WHERE slug = ${slug}`;
      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Skipping '${faq.title}' (already exists)`);
        continue;
      }

      // Insert faq series
      await sql`
        INSERT INTO faq_series (
          slug, title, description, content,
          featured_image, is_published, published_at
        ) VALUES (
          ${slug},
          ${faq.title || ''},
          ${faq.description || ''},
          ${faq.longText || ''},
          ${faq.image || null},
          true,
          NOW()
        )
      `;

      console.log(`   ✅ Imported: ${faq.title}`);
      imported++;

    } catch (error) {
      console.error(`   ❌ Error importing faq series '${faq.title}':`, error.message);
    }
  }

  console.log(`\n   📊 Results: ${imported} imported\n`);
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const entity = args[0] || 'all';

  console.log('╔════════════════════════════════════════╗');
  console.log('║   Kaş Guide Data Import                ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    if (entity === 'places' || entity === 'all') {
      await importPlaces();
    }

    if (entity === 'hotels' || entity === 'all') {
      await importHotels();
    }

    if (entity === 'pets' || entity === 'all') {
      await importPets();
    }

    if (entity === 'articles' || entity === 'all') {
      await importArticles();
    }

    if (entity === 'faqseries' || entity === 'faqspecial' || entity === 'all') {
      await importFaqSeries();
    }

    if (entity === 'faqs' || entity === 'all') {
      await importFAQs();
    }

    console.log('\n✨ Data import completed!\n');
  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly (works on both Unix and Windows)
const isMainModule = () => {
  const scriptPath = fileURLToPath(import.meta.url);
  const argPath = process.argv[1];
  return scriptPath === argPath || scriptPath.replace(/\\/g, '/') === argPath.replace(/\\/g, '/');
};

if (isMainModule()) {
  main();
}

export { importPlaces, importHotels, importPets, importArticles, importFaqSeries, importFAQs };
