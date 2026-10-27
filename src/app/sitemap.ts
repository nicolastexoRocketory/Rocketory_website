import type { MetadataRoute } from 'next'

import { BLOG_SLUGS } from '@/lib/legacy-page'
import { SITE_URL } from '@/lib/metadata'
import { getPublishedPostSlugs } from '@/lib/posts'
import { getPublishedProjectSlugs } from '@/lib/projects'

/**
 * Reihenfolge + Priority: wichtige Akquise-Seiten zuerst.
 * Hinweis: Google nutzt priority nur schwach; Discovery und interne Verlinkung zählen mehr.
 */
const STATIC_ROUTES = [
  { path: '', priority: 1 },
  { path: '/webdesign', priority: 0.9 },
  { path: '/seo', priority: 0.9 },
  { path: '/wartung', priority: 0.9 },
  { path: '/leistungen', priority: 0.9 },
  { path: '/kontakt', priority: 0.9 },
  { path: '/projekte', priority: 0.85 },
  { path: '/agentur', priority: 0.85 },
  { path: '/agentur/buende', priority: 0.8 },
  { path: '/standorte', priority: 0.8 },
  { path: '/technologien', priority: 0.75 },
  { path: '/blog', priority: 0.75 },
  { path: '/ki-check', priority: 0.7 },
  { path: '/impressum', priority: 0.3 },
  { path: '/datenschutz', priority: 0.3 },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const [postSlugs, projectSlugs] = await Promise.all([
    getPublishedPostSlugs(),
    getPublishedProjectSlugs(),
  ])

  const blogSlugs = [...new Set([...postSlugs, ...BLOG_SLUGS])]

  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority,
    })),
    ...projectSlugs.map((slug) => ({
      url: `${SITE_URL}/projekte/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
