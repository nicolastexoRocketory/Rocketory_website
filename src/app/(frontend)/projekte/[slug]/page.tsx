import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { buildProjectMetadata } from '@/lib/metadata'
import {
  getProjectPageData,
  getPublishedProjectBySlug,
  getPublishedProjectSlugs,
} from '@/lib/projects'
import { buildProjectPageSchema } from '@/lib/schema-org'

import '@/styles/references.css'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedProjectBySlug(slug)

  if (!project) {
    return { title: 'Nicht gefunden' }
  }

  return buildProjectMetadata(project)
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getPublishedProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const page = getProjectPageData(project)

  return (
    <>
      <PageSchema nodes={buildProjectPageSchema(project)} />
      <LegacyPage content={page.content} scripts={page.scripts} withBlogSidebar />
    </>
  )
}
