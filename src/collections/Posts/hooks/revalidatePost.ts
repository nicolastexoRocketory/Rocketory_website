import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

function revalidateBlogPaths(slug?: string | null, previousSlug?: string | null) {
  revalidatePath('/')
  revalidatePath('/blog')

  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`)
  }
}

export const revalidatePostAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateBlogPaths(
    typeof doc?.slug === 'string' ? doc.slug : null,
    typeof previousDoc?.slug === 'string' ? previousDoc.slug : null,
  )
  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateBlogPaths(typeof doc?.slug === 'string' ? doc.slug : null)
  return doc
}
