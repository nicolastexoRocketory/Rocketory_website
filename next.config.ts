import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const LONG_CACHE = 'public, max-age=31536000, immutable'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/media/file/:path*',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.webp',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.avif',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.jpg',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.jpeg',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.png',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.mp4',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.woff2',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
      {
        source: '/:path*.otf',
        headers: [{ key: 'Cache-Control', value: LONG_CACHE }],
      },
    ]
  },
  async redirects() {
    return [
      // Alte .html-URLs → Clean Paths
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/webdesign.html', destination: '/webdesign', permanent: true },
      { source: '/seo.html', destination: '/seo', permanent: true },
      { source: '/wartung.html', destination: '/wartung', permanent: true },
      { source: '/angebote.html', destination: '/leistungen', permanent: true },
      { source: '/leistungen.html', destination: '/leistungen', permanent: true },
      { source: '/agentur.html', destination: '/agentur', permanent: true },
      { source: '/agentur/buende.html', destination: '/agentur/buende', permanent: true },
      { source: '/standorte.html', destination: '/standorte', permanent: true },
      { source: '/technologien.html', destination: '/technologien', permanent: true },
      { source: '/blog.html', destination: '/blog', permanent: true },
      { source: '/projekte.html', destination: '/projekte', permanent: true },
      { source: '/kontakt.html', destination: '/kontakt', permanent: true },
      { source: '/ki-check.html', destination: '/ki-check', permanent: true },
      { source: '/impressum.html', destination: '/impressum', permanent: true },
      { source: '/datenschutz.html', destination: '/datenschutz', permanent: true },
      { source: '/blog/:slug.html', destination: '/blog/:slug', permanent: true },
      { source: '/projekte/:slug.html', destination: '/projekte/:slug', permanent: true },

      // Frühere Pfade / Umbenennungen
      { source: '/angebote', destination: '/leistungen', permanent: true },
      { source: '/leistungen/webdesign', destination: '/webdesign', permanent: true },
      { source: '/leistungen/seo', destination: '/seo', permanent: true },
      { source: '/leistungen/wartung', destination: '/wartung', permanent: true },
      { source: '/vorteile', destination: '/leistungen', permanent: true },
      { source: '/vorteile.html', destination: '/leistungen', permanent: true },
      { source: '/referenzen', destination: '/projekte', permanent: true },
      { source: '/referenzen.html', destination: '/projekte', permanent: true },
      { source: '/team', destination: '/agentur#team-portraits', permanent: true },
      { source: '/team.html', destination: '/agentur#team-portraits', permanent: true },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
