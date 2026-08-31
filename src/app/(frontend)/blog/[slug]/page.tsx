import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { parseLegacySchemaJson } from '@/lib/build-default-post-schema'
import { getBlogLegacyPage, getLegacyPageLead } from '@/lib/legacy-page'
import { buildLegacyBlogMetadata, buildPostMetadata } from '@/lib/metadata'
import {
  getBlogPostPageData,
  getPublishedPosts,
  getPublishedPostBySlug,
  getPublishedPostSlugs,
} from '@/lib/posts'
import { buildBlogPostPageSchema, buildLegacyBlogPostSchema } from '@/lib/schema-org'

import '@/styles/references.css'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (post) {
    return buildPostMetadata(post)
  }

  const legacy = getBlogLegacyPage(slug)
  if (!legacy) return { title: 'Nicht gefunden' }
  return buildLegacyBlogMetadata(slug, legacy.title)
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (post) {
    // Needed for internal cross-linking between blog posts.
    const allPosts = await getPublishedPosts()

    const page = getBlogPostPageData(post, allPosts)
    return (
      <>
        <PageSchema nodes={buildBlogPostPageSchema(post)} />
        <LegacyPage content={page.content} scripts={page.scripts} withBlogSidebar />
      </>
    )
  }

  const legacy = getBlogLegacyPage(slug)
  if (!legacy) notFound()

  const schema = parseLegacySchemaJson(
    fs.readFileSync(path.join(process.cwd(), 'legacy', 'blog', `${slug}.html`), 'utf-8'),
  )
  const lead = getLegacyPageLead(`blog/${slug}.html`)

  return (
    <>
      <PageSchema
        nodes={buildLegacyBlogPostSchema(slug, legacy.title, schema?.description || lead, schema?.image, {
          published: schema?.datePublished,
          modified: schema?.dateModified,
        })}
      />
      <LegacyPage {...legacy} withBlogSidebar />
    </>
  )
}
