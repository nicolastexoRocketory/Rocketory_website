import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

function safeRevalidate(path: string) {
  try {
    revalidatePath(path)
  } catch {
    // Außerhalb eines Next-Request-Kontexts (z. B. Seed-Skripte) nicht verfügbar
  }
}

function revalidateProjectPaths(slug?: string | null, previousSlug?: string | null) {
  safeRevalidate('/projekte')
  safeRevalidate('/agentur')

  if (slug) {
    safeRevalidate(`/projekte/${slug}`)
  }

  if (previousSlug && previousSlug !== slug) {
    safeRevalidate(`/projekte/${previousSlug}`)
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
