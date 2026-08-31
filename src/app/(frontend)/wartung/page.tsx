import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildWartungPageSchema, META_WARTUNG } from '@/lib/schema-org'

import '@/styles/agentur.css'
import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('wartung.html', '/wartung', {
  description: META_WARTUNG,
  image: '/assets/images/angebote-tech-stack.webp',
})

export default function WartungPage() {
  const page = getLegacyPage('wartung.html')
  return (
    <>
      <PageSchema nodes={buildWartungPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
