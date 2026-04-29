import type { Metadata } from 'next'
import Script from 'next/script'

import './globals.css'
import { SiteFrame } from '@/components/site-frame'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kasguide.de'),
  title: 'Kaş Guide | Gezilecek Yerler ve Restoran Rehberi',
  description:
    "Kaş Guide, Kaş'ta gezilecek yerler, restoranlar, barlar ve yerel öneriler sunan kapsamlı bir şehir rehberidir. Yerel uzmanlar tarafından hazırlandı.",
  keywords:
    'kaş gezilecek yerler, kaş restoranlar, kaş oteller, kaş gezi rehberi, kaş türkiye, kaş plajları, kaş aktiviteler',
  authors: [{ name: 'Kaş Guide Team' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Kaş Guide - Kaş'ta Gezilecek Yerler ve Yerel Rehber",
    description:
      "Kaş'ın en kapsamlı yerel rehberi. Gezilecek yerler, restoranlar, oteller, patili dostu mekanlar ve pratik seyahat bilgileri.",
    url: 'https://www.kasguide.de',
    siteName: 'Kaş Guide',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kaş Guide - Kaş'ta Gezilecek Yerler ve Yerel Rehber",
    description: "Kaş'ın en kapsamlı yerel rehberi.",
    site: '@thekasguide',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "wjhr4lc5yh");`}
        </Script>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  )
}
