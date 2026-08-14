import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildStandortePageSchema, LOCATION_OG_IMAGE, META_STANDORTE } from '@/lib/schema-org'

import '@/styles/references.css'
import '@/styles/agentur.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('standorte.html', '/standorte', {
  description: META_STANDORTE,
  image: LOCATION_OG_IMAGE,
})

export default function StandortePage() {
  const page = getLegacyPage('standorte.html')

  return (
    <>
      <PageSchema nodes={buildStandortePageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
