import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/leistungen/webdesign',
        destination: '/webdesign',
        permanent: true,
      },
      {
        source: '/leistungen/seo',
        destination: '/seo',
        permanent: true,
      },
      {
        source: '/leistungen/wartung',
        destination: '/wartung',
        permanent: true,
      },
      {
        source: '/vorteile',
        destination: '/angebote',
        permanent: true,
      },
      {
        source: '/vorteile.html',
        destination: '/angebote',
        permanent: true,
      },
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
