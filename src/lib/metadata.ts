import type { Metadata } from 'next'
import type { Post, Project } from '@/payload-types'

import { parseLegacySchemaJson } from './build-default-post-schema'
import { getBlogLegacyPage, getLegacyPage, getLegacyPageLead } from './legacy-page'
import { getPostHeroImage } from './posts'
import { getProjectHeroImage } from './projects'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rocketory.de'
export const SITE_NAME = 'Rocketory'
export const DEFAULT_DESCRIPTION =
  'Webdesign, SEO und Betreuung aus Bünde – persönlich gebaut, fair kalkuliert, langfristig betreut.'
export const DEFAULT_OG_IMAGE = '/assets/images/logo_1.png'

type ContentEntity = Post | Project

type PageMetadataOptions = {
  title: string
  description?: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  noIndex?: boolean
}

function resolveImageUrl(image?: string): string {
  if (!image) return DEFAULT_OG_IMAGE
  if (image.startsWith('http://') || image.startsWith('https://')) return image
  if (image.startsWith('/')) return image
  return `/${image}`
}

function resolveCanonicalPath(
  mainEntityOfPage: string | null | undefined,
  fallbackPath: string,
): string {
  if (!mainEntityOfPage) return fallbackPath

  if (mainEntityOfPage.startsWith('http://') || mainEntityOfPage.startsWith('https://')) {
    try {
      return new URL(mainEntityOfPage).pathname
    } catch {
      return fallbackPath
    }
  }

  if (mainEntityOfPage.startsWith('/')) {
    return mainEntityOfPage.replace(/\.html$/, '')
  }

  return fallbackPath
}

function toIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

function getContentDescription(entity: ContentEntity): string {
  return entity.excerpt || entity.schema?.blogPosting?.description || DEFAULT_DESCRIPTION
}

function getSeoOgImage(entity: ContentEntity): string | undefined {
  const image = entity.seo?.ogImage
  if (image && typeof image === 'object' && 'url' in image && image.url) {
    return image.url
  }
  return undefined
}

function buildContentMetadata(
  entity: ContentEntity,
  options: {
    defaultTitle: string
    path: string
    defaultImage: string
    type: 'article'
    publishedTime?: string
    modifiedTime?: string
  },
): Metadata {
  const seo = entity.seo

  return buildPageMetadata({
    title: seo?.metaTitle?.trim() || options.defaultTitle,
    description: seo?.metaDescription?.trim() || getContentDescription(entity),
    path: options.path,
    image: getSeoOgImage(entity) || options.defaultImage,
    type: options.type,
    publishedTime: options.publishedTime,
    modifiedTime: options.modifiedTime,
    noIndex: seo?.noIndex ?? false,
  })
}

export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const description = options.description?.trim() || DEFAULT_DESCRIPTION
  const image = resolveImageUrl(options.image)
  const canonical = options.path === '/' ? SITE_URL : `${SITE_URL}${options.path}`

  return {
    title: options.title,
    description,
    alternates: { canonical },
    ...(options.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: options.title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'de_DE',
      type: options.type || 'website',
      images: [{ url: image, alt: options.title }],
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      ...(options.modifiedTime ? { modifiedTime: options.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description,
      images: [image],
    },
  }
}

export function buildLegacyPageMetadata(
  relativePath: string,
  path: string,
  overrides?: Pick<PageMetadataOptions, 'description' | 'image'>,
): Metadata {
  const page = getLegacyPage(relativePath)
  const lead = getLegacyPageLead(relativePath)

  return buildPageMetadata({
    title: page.title,
    description: overrides?.description || lead,
    path,
    image: overrides?.image,
  })
}

export function buildPostMetadata(post: Post): Metadata {
  return buildContentMetadata(post, {
    defaultTitle: `${post.title} – Rocketory`,
    path: resolveCanonicalPath(post.schema?.blogPosting?.mainEntityOfPage, `/blog/${post.slug}`),
    defaultImage: getPostHeroImage(post),
    type: 'article',
    publishedTime: toIsoDate(post.publishedAt || post.schema?.blogPosting?.datePublished),
    modifiedTime: toIsoDate(
      post.schema?.blogPosting?.dateModified || post.publishedAt || post.schema?.blogPosting?.datePublished,
    ),
  })
}

export function buildProjectMetadata(project: Project): Metadata {
  return buildContentMetadata(project, {
    defaultTitle: `${project.title} – Rocketory`,
    path: resolveCanonicalPath(
      project.schema?.blogPosting?.mainEntityOfPage,
      `/projekte/${project.slug}`,
    ),
    defaultImage: getProjectHeroImage(project),
    type: 'article',
    publishedTime: toIsoDate(project.publishedAt || project.schema?.blogPosting?.datePublished),
    modifiedTime: toIsoDate(
      project.schema?.blogPosting?.dateModified ||
        project.publishedAt ||
        project.schema?.blogPosting?.datePublished,
    ),
  })
}

export function buildLegacyBlogMetadata(slug: string, title: string): Metadata {
  const legacy = getBlogLegacyPage(slug)
  const schema = legacy ? parseLegacySchemaJson(legacy.content) : null
  const lead = legacy ? getLegacyPageLead(`blog/${slug}.html`) : undefined

  return buildPageMetadata({
    title,
    description: schema?.description || lead,
    path: `/blog/${slug}`,
    image: schema?.image,
    type: 'article',
    publishedTime: toIsoDate(schema?.datePublished),
    modifiedTime: toIsoDate(schema?.dateModified || schema?.datePublished),
  })
}

/** @deprecated Use buildPageMetadata or buildLegacyPageMetadata instead. */
export function getLegacyMetadata(title: string) {
  return buildPageMetadata({ title, path: '/' })
}
