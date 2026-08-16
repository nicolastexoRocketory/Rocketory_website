import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import {
  getProjectCategories,
  getPublishedProjects,
  injectProjectsIntoProjekte,
} from '@/lib/projects'
import { buildProjekteListingSchema } from '@/lib/schema-org'

import '@/styles/references.css'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('projekte.html', '/projekte')

export default async function ProjektePage() {
  const page = getLegacyPage('projekte.html')
  const [projects, categories] = await Promise.all([
    getPublishedProjects(),
    getProjectCategories(),
  ])

  return (
    <>
      <PageSchema nodes={buildProjekteListingSchema(projects)} />
      <LegacyPage
        {...page}
        content={injectProjectsIntoProjekte(page.content, projects, categories)}
      />
    </>
  )
}
