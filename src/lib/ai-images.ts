import { unstable_cache } from 'next/cache'

import type { Media } from '@/payload-types'

import { getPayloadClient } from './payload'

function addUrlTokens(tokens: Set<string>, url?: string | null) {
  if (!url?.trim()) return

  const value = url.trim()
  tokens.add(value)

  try {
    const pathname = value.startsWith('http') ? new URL(value).pathname : value.split('?')[0]
    if (pathname) {
      tokens.add(pathname)
      const basename = pathname.split('/').pop()
      if (basename) tokens.add(basename)
    }
  } catch {
    const basename = value.split('?')[0].split('/').pop()
    if (basename) tokens.add(basename)
  }
}

function collectMediaMatchers(doc: Media): string[] {
  const tokens = new Set<string>()

  if (doc.filename) tokens.add(doc.filename)
  addUrlTokens(tokens, doc.url)
  addUrlTokens(tokens, doc.thumbnailURL)

  if (doc.sizes) {
    for (const size of Object.values(doc.sizes)) {
      if (!size) continue
      if (size.filename) tokens.add(size.filename)
      addUrlTokens(tokens, size.url)
    }
  }

  return [...tokens]
}

export async function fetchAiImageMatchers(): Promise<string[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'media',
    where: {
      isAiGenerated: {
        equals: true,
      },
    },
    limit: 500,
    pagination: false,
    depth: 0,
  })

  const matchers = new Set<string>()
  for (const doc of docs) {
    for (const token of collectMediaMatchers(doc as Media)) {
      matchers.add(token)
    }
  }

  return [...matchers].sort()
}

export const getAiImageMatchers = unstable_cache(fetchAiImageMatchers, ['ai-image-matchers'], {
  tags: ['ai-images'],
  revalidate: 3600,
})
