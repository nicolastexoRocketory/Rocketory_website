import { getPayloadClient } from '@/lib/payload'
import { sanitizeGoogleMapsUrl } from '@/lib/sanitize'

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Inject validated Maps URLs from email-settings into legacy page HTML. */
export async function applyGoogleMapsSettings(content: string): Promise<string> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'email-settings' })
    let next = content

    const embedUrl = sanitizeGoogleMapsUrl(settings.googleMapsEmbedUrl, 'embed')
    if (embedUrl) {
      const safe = escapeHtmlAttr(embedUrl)
      next = next.replace(
        /(<iframe[^>]*data-rk-google-maps-embed[^>]*data-src=")[^"]*(")/,
        `$1${safe}$2`,
      )
      next = next.replace(
        /(<iframe[^>]*data-rk-google-maps-embed[^>]*src=")[^"]*(")/,
        `$1${safe}$2`,
      )
    }

    const linkUrl = sanitizeGoogleMapsUrl(settings.googleMapsLinkUrl, 'link')
    if (linkUrl) {
      next = next.replace(
        /(<a[^>]*data-rk-google-maps-link[^>]*href=")[^"]*(")/,
        `$1${escapeHtmlAttr(linkUrl)}$2`,
      )
    }

    return next
  } catch {
    return content
  }
}
