import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildAngebotePageSchema } from '@/lib/schema-org'

import '@/styles/agentur.css'
import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('angebote.html', '/angebote')

export default function AngebotePage() {
  const page = getLegacyPage('angebote.html')
  return (
    <>
      <PageSchema nodes={buildAngebotePageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
