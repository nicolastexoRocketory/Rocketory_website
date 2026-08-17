import type { Media } from '@/payload-types'

import { buildOptimizedImgTag } from './optimized-image'

export type MediaA11yFields = {
  alt?: string | null
  isDecorative?: boolean | null
  isAiGenerated?: boolean | null
  ariaLabel?: string | null
  ariaDescription?: string | null
  caption?: string | null
}

export type AccessibleImageOptions = {
  src: string
  width: number
  height: number
  sizes: string
  loading?: 'lazy' | 'eager'
  media?: MediaA11yFields | null
  fallbackAlt: string
  idSuffix: string
  /** false = nur img/span/figcaption (z. B. innerhalb bestehender figure) */
  standaloneFigure?: boolean
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function buildAccessibleImageMarkup({
  src,
  width,
  height,
  sizes,
  loading = 'lazy',
  media,
  fallbackAlt,
  idSuffix,
  standaloneFigure = true,
}: AccessibleImageOptions): string {
  const descriptionId = `rk-img-desc-${idSuffix}`
  const isDecorative = Boolean(media?.isDecorative)
  const alt = isDecorative ? '' : (media?.alt?.trim() || fallbackAlt).trim()
  const extraAttrs: Record<string, string> = {}

  if (isDecorative) {
    extraAttrs.role = 'presentation'
    extraAttrs['aria-hidden'] = 'true'
  } else if (media?.ariaLabel?.trim()) {
    extraAttrs['aria-label'] = media.ariaLabel.trim()
  }

  if (!isDecorative && media?.ariaDescription?.trim()) {
    extraAttrs['aria-describedby'] = descriptionId
  }

  if (media?.isAiGenerated) {
    extraAttrs['data-rk-ai-image'] = 'true'
  }

  const img = buildOptimizedImgTag({
    src,
    width,
    height,
    alt,
    sizes,
    loading,
    priority: loading === 'eager',
    extraAttrs,
  })

  const description =
    !isDecorative && media?.ariaDescription?.trim()
      ? `<span id="${descriptionId}" class="rk-sr-only">${escapeAttr(media.ariaDescription.trim())}</span>`
      : ''

  const caption =
    !isDecorative && media?.caption?.trim()
      ? `<figcaption class="rk-media-caption">${escapeAttr(media.caption.trim())}</figcaption>`
      : ''

  const inner = `${img}${description}${caption}`

  if (standaloneFigure && (caption || description)) {
    return `<figure class="rk-media-figure">${inner}</figure>`
  }

  return inner
}

export function getPostHeroMedia(post: {
  heroImage?: number | Media | null
}): Media | null {
  if (post.heroImage && typeof post.heroImage === 'object') {
    return post.heroImage
  }
  return null
}
