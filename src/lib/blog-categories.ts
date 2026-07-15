export const BLOG_CATEGORIES = [
  { title: 'Praxis', slug: 'praxis' },
  { title: 'Design', slug: 'design' },
  { title: 'Technologie', slug: 'technologie' },
] as const

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]['slug']
