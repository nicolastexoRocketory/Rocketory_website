import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildVorteilePageSchema, META_VORTEILE } from '@/lib/schema-org'

import '@/styles/agentur.css'
import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('vorteile.html', '/vorteile', {
  description: META_VORTEILE,
  image: '/assets/images/team-rocketory.webp',
})

export default function VorteilePage() {
  const page = getLegacyPage('vorteile.html')
  return (
    <>
      <PageSchema nodes={buildVorteilePageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
