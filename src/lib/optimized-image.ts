import { getImageProps } from 'next/image'

export type OptimizedImageOptions = {
  src: string
  width: number
  height: number
  alt: string
  sizes: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  className?: string
  id?: string
  extraAttrs?: Record<string, string>
}

/** Payload-/Absolute-URLs auf same-origin Pfade reduzieren für den Next-Image-Optimizer. */
export function normalizeImageSrc(src: string): string {
  if (!src || src.startsWith('/')) return src

  try {
    const url = new URL(src)
    if (url.pathname.startsWith('/api/media/')) {
      return `${url.pathname}${url.search}`
    }
  } catch {
    return src
  }

  return src
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Optimiertes <img> als HTML-String (WebP/AVIF, srcset) für Legacy-HTML-Injection. */
export function buildOptimizedImgTag({
  src,
  width,
  height,
  alt,
  sizes,
  priority = false,
  loading,
  className,
  id,
  extraAttrs,
}: OptimizedImageOptions): string {
  const normalizedSrc = normalizeImageSrc(src)
  const { props } = getImageProps({
    src: normalizedSrc,
    width,
    height,
    alt,
    sizes,
    quality: 80,
    ...(priority ? { priority: true } : { loading: loading ?? 'lazy' }),
  })

  const attrs: string[] = []

  if (id) attrs.push(`id="${escapeAttr(id)}"`)
  if (className) attrs.push(`class="${escapeAttr(className)}"`)
  if (props.src) attrs.push(`src="${escapeAttr(String(props.src))}"`)
  if (props.srcSet) attrs.push(`srcset="${escapeAttr(String(props.srcSet))}"`)
  if (props.sizes) attrs.push(`sizes="${escapeAttr(String(props.sizes))}"`)
  if (props.width) attrs.push(`width="${props.width}"`)
  if (props.height) attrs.push(`height="${props.height}"`)
  if (props.loading) attrs.push(`loading="${props.loading}"`)
  if (props.decoding) attrs.push(`decoding="${props.decoding}"`)
  if (props.fetchPriority) attrs.push(`fetchpriority="${props.fetchPriority}"`)

  attrs.push(`alt="${escapeAttr(alt)}"`)

  if (extraAttrs) {
    for (const [key, value] of Object.entries(extraAttrs)) {
      attrs.push(`${key}="${escapeAttr(value)}"`)
    }
  }

  return `<img ${attrs.join(' ')}>`
}

function buildHomeHeroBackgroundHtml(): string {
  return `<img src="/assets/images/team-raketenstart.png" alt="" width="1024" height="682" id="rkHeroBg" class="rk-hero-img" fetchpriority="high" decoding="async" aria-hidden="true">`
}

/** Hero-Bilder direkt einbinden (ohne Next-Image-Optimierung / Komprimierung). */
export function injectHomeHeroImages(html: string): string {
  return html.replace(
    /<div class="rk-hero-bg" aria-hidden="true">[\s\S]*?<\/div>/,
    `<div class="rk-hero-bg" aria-hidden="true">${buildHomeHeroBackgroundHtml()}</div>`,
  )
}
