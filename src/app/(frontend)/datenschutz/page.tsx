import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildDatenschutzPageSchema } from '@/lib/schema-org'

import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('datenschutz.html', '/datenschutz')

export default function DatenschutzPage() {
  const page = getLegacyPage('datenschutz.html')
  return (
    <>
      <PageSchema nodes={buildDatenschutzPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
