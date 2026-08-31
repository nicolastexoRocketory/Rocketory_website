import { unstable_cache } from 'next/cache'

import type { Media } from '@/payload-types'

import { getPayloadClient } from './payload'

const ASSET_PATH_PATTERN = /(\/?(?:\.\.\/)?assets\/images\/[^\s,"'<>]+)/g

export type SiteMediaRegistry = {
  byPath: Record<string, Media>
  byFilename: Record<string, Media>
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Legacy-/HTML-Pfade auf /assets/images/… normalisieren (Query-Strings entfernen). */
export function normalizeAssetSitePath(href: string): string | null {
  const trimmed = href.trim()
  if (!trimmed) return null

  const withoutQuery = trimmed.split('?')[0].split('#')[0]
  const normalized = withoutQuery
    .replace(/^(\.\.\/)+/, '/')
    .replace(/^\/?assets\//, '/assets/')

  if (!normalized.startsWith('/assets/images/')) return null
  return normalized
}

export function getMediaPublicUrl(media: Media): string {
  if (media.filename?.trim()) {
    return `/api/media/file/${encodeURIComponent(media.filename.trim())}`
  }

  if (media.url?.trim()) {
    const url = media.url.trim()
    if (url.startsWith('/')) return url
    try {
      return new URL(url).pathname
    } catch {
      return url
    }
  }

  return ''
}

function resolveMediaForPath(path: string, registry: SiteMediaRegistry): Media | undefined {
  const normalized = normalizeAssetSitePath(path)
  if (!normalized) return undefined

  return registry.byPath[normalized]
}

function replaceAssetUrls(value: string, registry: SiteMediaRegistry): string {
  return value.replace(ASSET_PATH_PATTERN, (match) => {
    const media = resolveMediaForPath(match, registry)
    return media ? getMediaPublicUrl(media) : match
  })
}

function upsertAttr(tag: string, name: string, value: string): string {
  const pattern = new RegExp(`\\b${name}="[^"]*"`)
  const next = `${name}="${escapeAttr(value)}"`
  return pattern.test(tag) ? tag.replace(pattern, next) : tag.replace(/^<img\b/, `<img ${next}`)
}

function removeAttr(tag: string, name: string): string {
  return tag.replace(new RegExp(`\\s*${name}="[^"]*"`), '')
}

function applyMediaA11yToImgTag(tag: string, media: Media): string {
  const isDecorative = Boolean(media.isDecorative)
  const alt = isDecorative ? '' : (media.alt?.trim() || '')

  let result = upsertAttr(tag, 'alt', alt)

  if (isDecorative) {
    result = upsertAttr(result, 'aria-hidden', 'true')
    result = upsertAttr(result, 'role', 'presentation')
    result = removeAttr(result, 'aria-label')
  } else {
    result = removeAttr(result, 'aria-hidden')
    result = removeAttr(result, 'role')

    if (media.ariaLabel?.trim()) {
      result = upsertAttr(result, 'aria-label', media.ariaLabel.trim())
    } else {
      result = removeAttr(result, 'aria-label')
    }
  }

  if (media.isAiGenerated) {
    result = upsertAttr(result, 'data-rk-ai-image', 'true')
  } else {
    result = removeAttr(result, 'data-rk-ai-image')
  }

  return result
}

function patchImgTag(tag: string, registry: SiteMediaRegistry): string {
  const srcMatch = tag.match(/\bsrc="([^"]+)"/)
  if (!srcMatch) return tag

  const media = resolveMediaForPath(srcMatch[1], registry)
  if (!media) return tag

  let result = tag.replace(/\bsrc="[^"]+"/, `src="${escapeAttr(getMediaPublicUrl(media))}"`)

  if (/\bsrcset="/.test(result)) {
    result = result.replace(/\bsrcset="([^"]+)"/, (_, srcset: string) => {
      return `srcset="${escapeAttr(replaceAssetUrls(srcset, registry))}"`
    })
  }

  return applyMediaA11yToImgTag(result, media)
}

function patchSourceTag(tag: string, registry: SiteMediaRegistry): string {
  if (!/\bsrcset="/.test(tag)) return tag

  return tag.replace(/\bsrcset="([^"]+)"/, (_, srcset: string) => {
    return `srcset="${escapeAttr(replaceAssetUrls(srcset, registry))}"`
  })
}

/** Ersetzt statische /assets/images/…-Pfade durch CMS-Media-URLs und übernimmt A11y-Felder. */
export function injectSiteMedia(html: string, registry: SiteMediaRegistry): string {
  let result = html.replace(/<img\b[^>]*>/gi, (tag) => patchImgTag(tag, registry))
  result = result.replace(/<source\b[^>]*>/gi, (tag) => patchSourceTag(tag, registry))
  return result
}

export async function fetchSiteMediaRegistry(): Promise<SiteMediaRegistry> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'media',
    limit: 2000,
    pagination: false,
    depth: 0,
  })

  const byPath: Record<string, Media> = {}
  const byFilename: Record<string, Media> = {}

  for (const doc of docs) {
    const media = doc as Media

    if (media.sitePath) {
      const normalized = normalizeAssetSitePath(media.sitePath)
      if (normalized) byPath[normalized] = media
    }

    if (media.filename) {
      byFilename[media.filename] = media
    }
  }

  return { byPath, byFilename }
}

export const getSiteMediaRegistry = unstable_cache(fetchSiteMediaRegistry, ['site-media-registry'], {
  tags: ['site-media'],
  revalidate: 3600,
})

export async function getSiteMediaForPath(assetPath: string): Promise<Media | null> {
  const registry = await getSiteMediaRegistry()
  return resolveMediaForPath(assetPath, registry) ?? null
}

export async function getSiteMediaPublicUrl(assetPath: string): Promise<string> {
  const media = await getSiteMediaForPath(assetPath)
  return media ? getMediaPublicUrl(media) : assetPath
}

export async function applySiteMedia(html: string): Promise<string> {
  const registry = await getSiteMediaRegistry()
  return injectSiteMedia(html, registry)
}
