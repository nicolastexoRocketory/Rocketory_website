import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { getPayloadClient } from '@/lib/payload'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { getPublishedProjects, injectProjectsIntoAgentur } from '@/lib/projects'
import { buildAgenturPageSchema } from '@/lib/schema-org'

import '@/styles/references.css'
import '@/styles/agentur.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('agentur.html', '/agentur')

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function applyGoogleMapsSettings(content: string): Promise<string> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'email-settings' })
    let next = content

    if (settings.googleMapsEmbedUrl) {
      next = next.replace(
        /(<iframe[^>]*data-rk-google-maps-embed[^>]*data-src=")[^"]*(")/,
        `$1${escapeHtmlAttr(settings.googleMapsEmbedUrl)}$2`,
      )
      next = next.replace(
        /(<iframe[^>]*data-rk-google-maps-embed[^>]*src=")[^"]*(")/,
        `$1${escapeHtmlAttr(settings.googleMapsEmbedUrl)}$2`,
      )
    }

    if (settings.googleMapsLinkUrl) {
      next = next.replace(
        /(<a[^>]*data-rk-google-maps-link[^>]*href=")[^"]*(")/,
        `$1${escapeHtmlAttr(settings.googleMapsLinkUrl)}$2`,
      )
    }

    return next
  } catch {
    return content
  }
}

export default async function AgenturPage() {
  const page = getLegacyPage('agentur.html')
  const [withMaps, projects] = await Promise.all([
    applyGoogleMapsSettings(page.content),
    getPublishedProjects(),
  ])
  const content = injectProjectsIntoAgentur(withMaps, projects)

  return (
    <>
      <PageSchema nodes={buildAgenturPageSchema()} />
      <LegacyPage {...page} content={content} />
    </>
  )
}
