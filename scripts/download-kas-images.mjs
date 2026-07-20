#!/usr/bin/env node
// Tek seferlik script: Pexels API'sinden Kaş/Antalya temalı görseller indirir.
// Kullanım: node scripts/download-kas-images.mjs --target=news
//           node scripts/download-kas-images.mjs --target=places

import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')

const IMAGE_COUNT = 50
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search'

const NEWS_QUERIES = ['Kas Turkey', 'Antalya coast', 'Turkish riviera harbor', 'Mediterranean town Turkey']
const PLACE_QUERIES = ['Turkey coastline', 'Kas Turkey beach', 'Turkish restaurant terrace', 'Antalya old town street']

function parseArgs() {
  const targetArg = process.argv.find((arg) => arg.startsWith('--target='))
  const target = targetArg?.split('=')[1]

  if (target !== 'news' && target !== 'places') {
    console.error('Kullanım: node scripts/download-kas-images.mjs --target=news|places')
    process.exit(1)
  }

  return target
}

async function fetchQueryPage(apiKey, query, page) {
  const url = new URL(PEXELS_SEARCH_URL)
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '20')
  url.searchParams.set('page', String(page))

  const response = await fetch(url, {
    headers: { Authorization: apiKey },
  })

  if (!response.ok) {
    throw new Error(`Pexels API hatası (${response.status}) — sorgu: "${query}"`)
  }

  const data = await response.json()
  return data.photos ?? []
}

async function collectUniquePhotos(apiKey, queries, count) {
  const seen = new Set()
  const photos = []

  for (const query of queries) {
    if (photos.length >= count) break

    let page = 1
    while (photos.length < count && page <= 3) {
      const results = await fetchQueryPage(apiKey, query, page)
      if (results.length === 0) break

      for (const photo of results) {
        if (photos.length >= count) break
        if (seen.has(photo.id)) continue
        seen.add(photo.id)
        photos.push(photo)
      }

      page += 1
    }
  }

  return photos.slice(0, count)
}

async function downloadPhoto(photo, destPath) {
  const imageUrl = photo.src.large ?? photo.src.medium ?? photo.src.original
  const response = await fetch(imageUrl)

  if (!response.ok || !response.body) {
    throw new Error(`Görsel indirilemedi: ${imageUrl}`)
  }

  await pipeline(response.body, createWriteStream(destPath))
}

async function main() {
  const target = parseArgs()
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    console.error('PEXELS_API_KEY ortam değişkeni bulunamadı. .env.local dosyasını kontrol edin.')
    process.exit(1)
  }

  const queries = target === 'news' ? NEWS_QUERIES : PLACE_QUERIES
  const prefix = target === 'news' ? 'kas-news' : 'kas-place'
  const destDir = path.join(PROJECT_ROOT, 'public', 'images', target)

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true })
  }

  console.log(`[${target}] Pexels'ten benzersiz görseller aranıyor...`)
  const photos = await collectUniquePhotos(apiKey, queries, IMAGE_COUNT)
  console.log(`[${target}] ${photos.length}/${IMAGE_COUNT} görsel bulundu, indiriliyor...`)

  let downloaded = 0
  for (let i = 0; i < photos.length; i++) {
    const index = String(i + 1).padStart(2, '0')
    const destPath = path.join(destDir, `${prefix}-${index}.jpg`)

    try {
      await downloadPhoto(photos[i], destPath)
      downloaded += 1
    } catch (error) {
      console.error(`[${target}] Görsel ${index} indirilemedi:`, error.message)
    }
  }

  console.log(`[${target}] Tamamlandı: ${downloaded}/${photos.length} görsel indirildi → ${destDir}`)
}

main().catch((error) => {
  console.error('Beklenmeyen hata:', error)
  process.exit(1)
})
