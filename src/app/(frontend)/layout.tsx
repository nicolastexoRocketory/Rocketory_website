import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif, Inter } from 'next/font/google'
import React from 'react'

import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/metadata'
import { SiteSchema } from '@/components/SiteSchema'
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
    default: 'Rocketory – All in One Webdesign und SEO aus Bünde',
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
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
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
      </head>
      <body>
        <SiteSchema />
        {children}
      </body>
    </html>
  )
}
