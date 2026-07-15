import type { Category, Post } from '@/payload-types'

const FALLBACK_SLUG = 'praxis'
const FALLBACK_LABEL = 'Praxis'

export function resolvePostCategory(post: Post): { slug: string; label: string } {
  const category = post.category

  if (category && typeof category === 'object') {
    return {
      slug: category.slug || FALLBACK_SLUG,
      label: category.title || FALLBACK_LABEL,
    }
  }

  return { slug: FALLBACK_SLUG, label: FALLBACK_LABEL }
}

export function resolveCategoryRef(
  category: Post['category'],
): Category | null {
  if (category && typeof category === 'object') {
    return category
  }
  return null
}
