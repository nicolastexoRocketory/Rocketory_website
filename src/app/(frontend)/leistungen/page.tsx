import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildLeistungenPageSchema } from '@/lib/schema-org'

import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('leistungen.html', '/leistungen')

export default function LeistungenPage() {
  const page = getLegacyPage('leistungen.html')
  return (
    <>
      <PageSchema nodes={buildLeistungenPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
