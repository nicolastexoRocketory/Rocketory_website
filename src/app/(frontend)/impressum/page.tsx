import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildImpressumPageSchema } from '@/lib/schema-org'

import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('impressum.html', '/impressum')

export default function ImpressumPage() {
  const page = getLegacyPage('impressum.html')
  return (
    <>
      <PageSchema nodes={buildImpressumPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
