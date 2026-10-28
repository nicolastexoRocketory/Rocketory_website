import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { applyGoogleMapsSettings } from '@/lib/google-maps-settings'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildAgenturBuendePageSchema, LOCATION_OG_IMAGE, META_AGENTUR_BUENDE } from '@/lib/schema-org'

import '@/styles/references.css'
import '@/styles/agentur.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('agentur/buende.html', '/agentur/buende', {
  description: META_AGENTUR_BUENDE,
  image: LOCATION_OG_IMAGE,
})

export default async function AgenturBuendePage() {
  const page = getLegacyPage('agentur/buende.html')
  const content = await applyGoogleMapsSettings(page.content)

  return (
    <>
      <PageSchema nodes={buildAgenturBuendePageSchema()} />
      <LegacyPage {...page} content={content} />
    </>
  )
}
