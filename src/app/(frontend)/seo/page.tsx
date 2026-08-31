import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildSeoPageSchema, META_SEO } from '@/lib/schema-org'

import '@/styles/agentur.css'
import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('seo.html', '/seo', {
  description: META_SEO,
  image: '/assets/images/angebote-teaser-astronaut.webp',
})

export default function SeoPage() {
  const page = getLegacyPage('seo.html')
  return (
    <>
      <PageSchema nodes={buildSeoPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
