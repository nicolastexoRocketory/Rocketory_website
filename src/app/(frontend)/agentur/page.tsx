import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { applyGoogleMapsSettings } from '@/lib/google-maps-settings'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { getPublishedProjects, injectProjectsIntoAgentur } from '@/lib/projects'
import { buildAgenturPageSchema } from '@/lib/schema-org'

import '@/styles/references.css'
import '@/styles/agentur.css'
import '@/styles/team.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('agentur.html', '/agentur')

export default async function AgenturPage() {
  const page = getLegacyPage('agentur.html')
  const [withMaps, projects] = await Promise.all([
    applyGoogleMapsSettings(page.content),
    getPublishedProjects(),
  ])
  const content = injectProjectsIntoAgentur(withMaps, projects)

  return (
    <>
      <PageSchema nodes={buildAgenturPageSchema()} />
      <LegacyPage {...page} content={content} />
    </>
  )
}
