import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildWebdesignPageSchema, META_WEBDESIGN } from '@/lib/schema-org'

import '@/styles/agentur.css'
import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('webdesign.html', '/webdesign', {
  description: META_WEBDESIGN,
  image: '/assets/images/webdesign-hero.jpg',
})

export default function WebdesignPage() {
  const page = getLegacyPage('webdesign.html')
  return (
    <>
      <PageSchema nodes={buildWebdesignPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
