#!/usr/bin/env node
/**
 * Import Static Data to Supabase
 * Imports data from places-data.js, hotels-data.js, pet-data.js, articles-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for pg
const { default: sql } = await import('./connection.js');

// Helper to read JS files and extract data
async function readJSData(filePath, varName) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return [];
    }
    
    // Create a temporary module to import the data
    const module = await import(fullPath);
    return module[varName] || module.default || [];
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Import Places
async function importPlaces() {
  console.log('\n📍 Importing Places...');
  try {
    const { allPlaces } = await import('../places/places-data.js');
    
    if (!allPlaces || allPlaces.length === 0) {
      console.log('   No places found');
      return 0;
    }
    
    let imported = 0;
    for (const place of allPlaces) {
      try {
        // Check if already exists
        const existing = await sql`SELECT id FROM items WHERE slug = ${place.id}`;
        if (existing.rows.length > 0) {
          console.log(`   ⏭️  Skipping ${place.id} (already exists)`);
          continue;
        }
        
        // Generate item number
        const itemNumResult = await sql`SELECT get_next_item_number('place') as num`;
        const itemNumber = itemNumResult.rows[0].num;
        
        // Prepare attributes
        const attributes = {
          badge_id: place.badgeId || 'tourist',
          categories: place.category || [],
          price: place.price || '',
          selected: place.selected || false,
          distance: place.distance || '',
          duration: place.duration || '',
          access_info: place.accessInfo || '',
          google_maps_query: place.googleMapsQuery || '',
          facilities: place.facilities || [],
          features: place.features || [],
          tags: place.tags || []
        };
        
        // Prepare photos
        const photos = [];
        if (place.image) {
          photos.push({ url: place.image, sequence: 0, is_primary: true });
        }
        if (place.images && Array.isArray(place.images)) {
          place.images.forEach((img, idx) => {
            if (img !== place.image) {
              photos.push({ url: img, sequence: idx + 1 });
            }
          });
        }
        
        await sql`
          INSERT INTO items (
            item_number, item_type, slug, title, description, long_text,
            phone, website, instagram, location, coordinates_lat, coordinates_lng,
            rating, verified, status, photos, attributes, published_at
          ) VALUES (
            ${itemNumber}, 'place', ${place.id}, ${place.title}, ${place.description},
            ${place.longText || place.description}, ${place.phone || ''}, ${place.website || ''},
            ${place.instagram || ''}, ${place.location || ''}, 
            ${place.coordinates?.lat || null}, ${place.coordinates?.lng || null},
            ${place.rating || null}, true, 'approved',
            ${JSON.stringify(photos)}::jsonb, ${JSON.stringify(attributes)}::jsonb, NOW()
          )
        `;
        
        imported++;
        console.log(`   ✅ ${itemNumber}: ${place.title}`);
      } catch (err) {
        console.error(`   ❌ Failed to import ${place.id}:`, err.message);
      }
    }
    
    console.log(`   Imported ${imported}/${allPlaces.length} places`);
    return imported;
  } catch (error) {
    console.error('❌ Error importing places:', error.message);
    return 0;
  }
}

// Import Hotels
async function importHotels() {
  console.log('\n🏨 Importing Hotels...');
  try {
    const { allHotels } = await import('../hotel/hotels-data.js');
    
    if (!allHotels || allHotels.length === 0) {
      console.log('   No hotels found');
      return 0;
    }
    
    let imported = 0;
    for (const hotel of allHotels) {
      try {
        // Skip example/template hotels
        if (hotel.id?.includes('ornek') || hotel.id?.includes('template')) {
          continue;
        }
        
        // Check if already exists
        const existing = await sql`SELECT id FROM items WHERE slug = ${hotel.id}`;
        if (existing.rows.length > 0) {
          console.log(`   ⏭️  Skipping ${hotel.id} (already exists)`);
          continue;
        }
        
        // Generate item number
        const itemNumResult = await sql`SELECT get_next_item_number('hotel') as num`;
        const itemNumber = itemNumResult.rows[0].num;
        
        // Prepare attributes
        const attributes = {
          hotel_type: hotel.hotelType || 'butik',
          star_rating: hotel.starRating || '',
          room_count: hotel.roomCount || null,
          capacity: hotel.capacity || null,
          price_range: hotel.priceRange || 'mid',
          checkin_time: hotel.checkinTime || '14:00',
          checkout_time: hotel.checkoutTime || '11:00',
          distance_to_sea: hotel.distanceToSea || '',
          booking_url: hotel.booking || '',
          google_maps_query: hotel.googleMapsQuery || '',
          facilities: hotel.facilities || [],
          tags: hotel.tags || [],
          review_count: hotel.reviewCount || 0
        };
        
        // Prepare photos
        const photos = [];
        if (hotel.image) {
          photos.push({ url: hotel.image, sequence: 0, is_primary: true });
        }
        if (hotel.images && Array.isArray(hotel.images)) {
          hotel.images.forEach((img, idx) => {
            if (img !== hotel.image) {
              photos.push({ url: img, sequence: idx + 1 });
            }
          });
        }
        
        await sql`
          INSERT INTO items (
            item_number, item_type, slug, title, description, long_text,
            phone, email, website, instagram, location, coordinates_lat, coordinates_lng,
            rating, verified, status, photos, attributes, published_at
          ) VALUES (
            ${itemNumber}, 'hotel', ${hotel.id}, ${hotel.title}, ${hotel.description},
            ${hotel.longText || hotel.description}, ${hotel.phone || ''}, ${hotel.email || ''},
            ${hotel.website || ''}, ${hotel.instagram || ''}, ${hotel.location || ''},
            ${hotel.coordinates?.lat || null}, ${hotel.coordinates?.lng || null},
            ${hotel.rating || null}, true, 'approved',
            ${JSON.stringify(photos)}::jsonb, ${JSON.stringify(attributes)}::jsonb, NOW()
          )
        `;
        
        imported++;
        console.log(`   ✅ ${itemNumber}: ${hotel.title}`);
      } catch (err) {
        console.error(`   ❌ Failed to import ${hotel.id}:`, err.message);
      }
    }
    
    console.log(`   Imported ${imported}/${allHotels.length} hotels`);
    return imported;
  } catch (error) {
    console.error('❌ Error importing hotels:', error.message);
    return 0;
  }
}

// Import Pets
async function importPets() {
  console.log('\n🐾 Importing Pets...');
  try {
    const { pets } = await import('../pet/pet-data.js');
    
    if (!pets || pets.length === 0) {
      console.log('   No pets found');
      return 0;
    }
    
    let imported = 0;
    for (const pet of pets) {
      try {
        // Check if already exists by pet number
        const existing = await sql`SELECT id FROM items WHERE item_number = ${pet.id}`;
        if (existing.rows.length > 0) {
          console.log(`   ⏭️  Skipping ${pet.id} (already exists)`);
          continue;
        }
        
        // Prepare attributes
        const attributes = {
          listing_type: 'found', // demo data is usually found pets
          pet_type: pet.type || 'kedi',
          age: pet.age || '',
          breed: pet.breed || '',
          short_note: pet.shortNote || '',
          extra_notes: pet.extraNotes || ''
        };
        
        // Prepare photos
        const photos = [];
        if (pet.photos && Array.isArray(pet.photos)) {
          pet.photos.forEach((img, idx) => {
            photos.push({ url: img, sequence: idx });
          });
        }
        
        await sql`
          INSERT INTO items (
            item_number, item_type, slug, title, description,
            phone, status, photos, attributes, created_at
          ) VALUES (
            ${pet.id}, 'pet', NULL, ${pet.type + ' - ' + pet.breed}, ${pet.shortNote},
            '', 'active', ${JSON.stringify(photos)}::jsonb, ${JSON.stringify(attributes)}::jsonb,
            ${pet.createdAt ? new Date(pet.createdAt) : new Date()}
          )
        `;
        
        imported++;
        console.log(`   ✅ ${pet.id}: ${pet.type} - ${pet.breed}`);
      } catch (err) {
        console.error(`   ❌ Failed to import ${pet.id}:`, err.message);
      }
    }
    
    console.log(`   Imported ${imported}/${pets.length} pets`);
    return imported;
  } catch (error) {
    console.error('❌ Error importing pets:', error.message);
    return 0;
  }
}

// Import Articles
async function importArticles() {
  console.log('\n📰 Importing Articles...');
  try {
    const { articles } = await import('../articles/articles-data.js');
    
    if (!articles || articles.length === 0) {
      console.log('   No articles found');
      return 0;
    }
    
    let imported = 0;
    for (const article of articles) {
      try {
        // Check if already exists
        const existing = await sql`SELECT id FROM articles WHERE slug = ${article.id}`;
        if (existing.rows.length > 0) {
          console.log(`   ⏭️  Skipping ${article.id} (already exists)`);
          continue;
        }
        
        await sql`
          INSERT INTO articles (
            slug, title, description, content, author, read_time, 
            featured_image, status, published_at
          ) VALUES (
            ${article.id}, ${article.title}, ${article.description},
            ${article.longText || article.description}, ${article.author || 'Kaş Guide'},
            ${article.readTime || ''}, ${article.image || ''}, 'published', NOW()
          )
        `;
        
        // Insert tags if any
        if (article.tags && article.tags.length > 0) {
          const articleResult = await sql`SELECT id FROM articles WHERE slug = ${article.id}`;
          const articleId = articleResult.rows[0]?.id;
          if (articleId) {
            for (const tag of article.tags) {
              await sql`INSERT INTO article_tags (article_id, tag_name) VALUES (${articleId}, ${tag})`;
            }
          }
        }
        
        imported++;
        console.log(`   ✅ ${article.id}: ${article.title}`);
      } catch (err) {
        console.error(`   ❌ Failed to import ${article.id}:`, err.message);
      }
    }
    
    console.log(`   Imported ${imported}/${articles.length} articles`);
    return imported;
  } catch (error) {
    console.error('❌ Error importing articles:', error.message);
    return 0;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Static Data Import to Supabase\n');
  console.log('==========================================');
  
  try {
    // Test connection
    const testResult = await sql`SELECT NOW() as time`;
    console.log('✅ Connected to Supabase');
    console.log(`   Server Time: ${testResult.rows[0].time}\n`);
    
    // Import data
    const results = {
      places: await importPlaces(),
      hotels: await importHotels(),
      pets: await importPets(),
      articles: await importArticles()
    };
    
    console.log('\n==========================================');
    console.log('📊 Import Summary:');
    console.log('==========================================');
    console.log(`   Places:   ${results.places} imported`);
    console.log(`   Hotels:   ${results.hotels} imported`);
    console.log(`   Pets:     ${results.pets} imported`);
    console.log(`   Articles: ${results.articles} imported`);
    console.log('==========================================');
    console.log('\n✅ Import completed!');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
