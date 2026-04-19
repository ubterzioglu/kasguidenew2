import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    host: 'https://www.kasguide.de',
    sitemap: 'https://www.kasguide.de/sitemap.xml',
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/review',
          '/result',
          '/planner/private',
          '/*?q=*',
          '/*?debug=*',
        ],
      },
    ],
  }
}
