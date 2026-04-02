#!/usr/bin/env node
import sql from './connection.js';

const tables = [
  { name: 'items', filter: "item_type = 'place'", label: 'Places' },
  { name: 'items', filter: "item_type = 'hotel'", label: 'Hotels' },
  { name: 'items', filter: "item_type = 'pet'", label: 'Pets' },
  { name: 'items', filter: "item_type = 'artist'", label: 'Artists' },
  { name: 'articles', filter: null, label: 'Articles' },
  { name: 'categories', filter: null, label: 'Categories' },
  { name: 'badges', filter: null, label: 'Badges' }
];

console.log('📊 Supabase Database Summary:');
console.log('==============================');

for (const t of tables) {
  let query = 'SELECT COUNT(*) as count FROM ' + t.name;
  if (t.filter) query += ' WHERE ' + t.filter;
  const result = await sql.query(query);
  console.log(t.label.padEnd(15) + ': ' + result.rows[0].count);
}

console.log('==============================');
console.log('\n✅ Veritabanı bağlantısı aktif ve veriler yüklü!');
