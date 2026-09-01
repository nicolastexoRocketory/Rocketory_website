import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif, Inter } from 'next/font/google'
import React, { Suspense } from 'react'

import { DEFAULT_DESCRIPTION, HOME_PAGE_TITLE, SITE_NAME, SITE_URL } from '@/lib/metadata'
import { isMatomoTrackingConfigured } from '@/lib/matomo'
import { buildMatomoHeadScript } from '@/lib/matomo/tracking-snippet'
import { AiImageRegistry } from '@/components/AiImageRegistry'
import { SiteSchema } from '@/components/SiteSchema'
import { CookieBanner } from '@/components/CookieBanner'
import { MatomoTracker } from '@/components/MatomoTracker'
import { ContactFloat } from '@/components/ContactFloat'
import { IN_APP_GUARD_HEAD_SCRIPT } from '@/lib/in-app-guard-snippet'
import '@/styles/main.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500'],
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_PAGE_TITLE,
    template: '%s',
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/images/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL?.trim()
  const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID?.trim()
  const matomoEnabled = isMatomoTrackingConfigured() && Boolean(matomoUrl && matomoSiteId)

  return (
    <html
      lang="de"
      className={`${dmSans.variable} ${inter.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <link
          rel="preload"
          href="/assets/fonts/Rostex-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        {matomoEnabled ? (
          <script
            dangerouslySetInnerHTML={{
              __html: buildMatomoHeadScript(matomoUrl!, matomoSiteId!),
            }}
          />
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: IN_APP_GUARD_HEAD_SCRIPT,
          }}
        />
      </head>
      <body>
        <AiImageRegistry />
        <SiteSchema />
        {children}
        <ContactFloat />
        <CookieBanner />
        {matomoEnabled ? (
          <Suspense fallback={null}>
            <MatomoTracker url={matomoUrl!} siteId={matomoSiteId!} />
          </Suspense>
        ) : null}
      </body>
    </html>
  )
}
