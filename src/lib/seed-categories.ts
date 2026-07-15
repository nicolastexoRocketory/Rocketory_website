import type { Payload } from 'payload'

import { BLOG_CATEGORIES, type BlogCategorySlug } from '../lib/blog-categories'

export async function seedBlogCategories(payload: Payload) {
  const ids: Record<BlogCategorySlug, number> = {} as Record<BlogCategorySlug, number>

  for (const category of BLOG_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      ids[category.slug] = existing.docs[0].id
      console.log(`Kategorie vorhanden: ${category.title}`)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: category,
      })
      ids[category.slug] = created.id
      console.log(`Kategorie erstellt: ${category.title}`)
    }
  }

  return ids
}

export async function backfillMediaTitles(payload: Payload) {
  const media = await payload.find({
    collection: 'media',
    limit: 500,
  })

  for (const item of media.docs) {
    if (item.title?.trim()) continue

    const title = item.filename
      ? item.filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
      : `Medium ${item.id}`

    await payload.update({
      collection: 'media',
      id: item.id,
      data: { title },
    })
    console.log(`Media-Titel gesetzt: ${title}`)
  }
}
