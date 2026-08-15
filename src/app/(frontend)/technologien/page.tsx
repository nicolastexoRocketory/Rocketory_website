import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { buildTechnologienPageSchema } from '@/lib/schema-org'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('technologien.html', '/technologien')

export default function TechnologienPage() {
  const page = getLegacyPage('technologien.html')
  return (
    <>
      <PageSchema nodes={buildTechnologienPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
