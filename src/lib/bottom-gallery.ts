import type { Media } from '@/payload-types'

import { buildAccessibleImageMarkup } from './media-a11y'
import { normalizeExternalUrl } from './normalize-external-url'

export type BottomGalleryEntry = {
  image: number | Media
  caption?: string | null
  id?: string | null
}

export type BottomGalleryOwner = {
  id: number
  title: string
  bottomGallery?: BottomGalleryEntry[] | null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resolveGalleryMedia(entry: BottomGalleryEntry): Media | null {
  if (!entry?.image) return null
  return typeof entry.image === 'object' ? entry.image : null
}

/** Slideshow am Ende von Blog- oder Referenz-Beiträgen */
export function buildBottomGalleryHtml(
  owner: BottomGalleryOwner,
  idPrefix: string,
): string {
  const items = (owner.bottomGallery || [])
    .map((entry, index) => {
      const media = resolveGalleryMedia(entry)
      if (!media?.url) return ''
      const caption = entry.caption?.trim() || media.caption?.trim() || ''
      // Caption nur einmal unter dem Slide – nicht zusätzlich aus media-a11y
      const imageMarkup = buildAccessibleImageMarkup({
        src: normalizeExternalUrl(media.url),
        width: media.width || 1400,
        height: media.height || 900,
        sizes: '(max-width: 768px) 100vw, 900px',
        media: { ...media, caption: null },
        fallbackAlt: caption || `${owner.title} – Bild ${index + 1}`,
        idSuffix: `${idPrefix}-${owner.id}-${index}`,
        standaloneFigure: false,
      })

      return `
              <figure class="rk-blog-gallery-slide" data-rk-blog-slide>
                ${imageMarkup}
                ${caption ? `<figcaption class="rk-blog-gallery-caption">${escapeHtml(caption)}</figcaption>` : ''}
              </figure>`
    })
    .filter(Boolean)

  if (items.length === 0) return ''

  return `
            <section class="rk-blog-gallery" aria-label="Bildergalerie">
              <div
                class="rk-featured-slider rk-blog-gallery-slider"
                data-rk-blog-slider
                data-rk-per-view="1"
                tabindex="0"
                aria-label="Bildergalerie"
              >
                <div class="rk-featured-slider-viewport" aria-live="polite">
                  <div class="rk-featured-slider-track" data-rk-blog-slider-track>
                    ${items.join('\n')}
                  </div>
                </div>
                <div class="rk-featured-slider-nav">
                  <button type="button" class="rk-featured-slider-btn" data-rk-blog-slider-prev aria-label="Vorheriges Bild">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <div class="rk-featured-slider-dots" data-rk-blog-slider-dots role="tablist" aria-label="Bilder"></div>
                  <span class="rk-featured-slider-count" data-rk-blog-slider-count aria-hidden="true">1 / ${items.length}</span>
                  <button type="button" class="rk-featured-slider-btn" data-rk-blog-slider-next aria-label="Nächstes Bild">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </section>`
}
