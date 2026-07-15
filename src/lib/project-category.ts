import type { Project, ProjectCategory } from '@/payload-types'

const FALLBACK_SLUG = 'website'
const FALLBACK_LABEL = 'Website'

export function resolveProjectCategory(project: Project): { slug: string; label: string } {
  const category = project.category

  if (category && typeof category === 'object') {
    return {
      slug: category.slug || FALLBACK_SLUG,
      label: category.title || FALLBACK_LABEL,
    }
  }

  return { slug: FALLBACK_SLUG, label: FALLBACK_LABEL }
}

export function resolveProjectCategoryRef(
  category: Project['category'],
): ProjectCategory | null {
  if (category && typeof category === 'object') {
    return category
  }
  return null
}
