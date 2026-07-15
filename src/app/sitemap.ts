import type { MetadataRoute } from 'next'

import { BLOG_SLUGS } from '@/lib/legacy-page'
import { SITE_URL } from '@/lib/metadata'
import { getPublishedPostSlugs } from '@/lib/posts'
import { getPublishedProjectSlugs } from '@/lib/projects'

const STATIC_ROUTES = [
  { path: '', priority: 1 },
  { path: '/agentur', priority: 0.8 },
  { path: '/angebote', priority: 0.8 },
  { path: '/technologien', priority: 0.8 },
  { path: '/blog', priority: 0.8 },
  { path: '/projekte', priority: 0.8 },
  { path: '/kontakt', priority: 0.7 },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postSlugs, projectSlugs] = await Promise.all([
    getPublishedPostSlugs(),
    getPublishedProjectSlugs(),
  ])

  const blogSlugs = [...new Set([...postSlugs, ...BLOG_SLUGS])]

  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'weekly' as const,
      priority,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...projectSlugs.map((slug) => ({
      url: `${SITE_URL}/projekte/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
