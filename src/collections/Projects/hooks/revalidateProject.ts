import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

function revalidateProjectPaths(slug?: string | null, previousSlug?: string | null) {
  revalidatePath('/projekte')

  if (slug) {
    revalidatePath(`/projekte/${slug}`)
  }

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/projekte/${previousSlug}`)
  }
}

export const revalidateProjectAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateProjectPaths(
    typeof doc?.slug === 'string' ? doc.slug : null,
    typeof previousDoc?.slug === 'string' ? previousDoc.slug : null,
  )
  return doc
}

export const revalidateProjectAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateProjectPaths(typeof doc?.slug === 'string' ? doc.slug : null)
  return doc
}
