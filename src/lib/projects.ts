import type { Project } from '@/payload-types'

import { buildPostSchemaJsonLd } from './build-post-schema-jsonld'
import { getBlogSidebarHtml, normalizeBlogArticleHtml } from './blog-content'
import { injectContentListing } from './content-listing'
import { buildAccessibleImageMarkup, getPostHeroMedia } from './media-a11y'
import { getPayloadClient } from './payload'
import { resolveProjectCategory } from './project-category'
import { transformAssets, transformLinks } from './static-html'

const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&h=700&fit=crop'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatGermanDate(value?: string | null) {
  if (!value) return { iso: '', label: '' }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { iso: '', label: '' }
  return {
    iso: date.toISOString().slice(0, 10),
    label: date.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Berlin',
    }),
  }
}

function normalizeArticleHtml(html: string): string {
  return normalizeBlogArticleHtml(html)
}

export function getProjectHeroImage(project: Project): string {
  if (project.heroImage && typeof project.heroImage === 'object' && project.heroImage.url) {
    return project.heroImage.url
  }

  return project.heroImageUrl || project.schema?.blogPosting?.image || DEFAULT_HERO
}

export async function getPublishedProjects() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'projects',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })

  return result.docs
}

export async function getProjectCategories() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'project-categories',
    sort: 'title',
    limit: 100,
  })

  return result.docs.map((category) => ({
    slug: category.slug,
    title: category.title,
  }))
}

export async function getPublishedProjectBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'projects',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] ?? null
}

export async function getPublishedProjectSlugs() {
  const projects = await getPublishedProjects()
  return projects.map((project) => project.slug)
}

export function buildProjectCardHtml(project: Project): string {
  const date = formatGermanDate(project.publishedAt)
  const image = getProjectHeroImage(project)
  const heroMedia = getPostHeroMedia(project)
  const excerpt = project.excerpt || project.schema?.blogPosting?.description || ''
  const { slug: categorySlug, label: categoryLabel } = resolveProjectCategory(project)

  const dateHtml = date.iso
    ? `<time datetime="${escapeHtml(date.iso)}">${escapeHtml(date.label)}</time>`
    : ''

  const imageMarkup = buildAccessibleImageMarkup({
    src: image,
    width: 1200,
    height: 675,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
    media: heroMedia,
    fallbackAlt: project.title,
    idSuffix: `project-card-${project.id}`,
    standaloneFigure: false,
  })

  return `
          <article class="rk-post-card" data-category="${escapeHtml(categorySlug)}">
            <a class="rk-post-card-link" href="/projekte/${escapeHtml(project.slug)}">
              <figure class="rk-post-card-media">
                ${imageMarkup}
              </figure>
              <div class="rk-post-card-body">
                <div class="rk-post-card-meta">
                  ${dateHtml}
                  <span class="rk-post-card-cat">${escapeHtml(categoryLabel)}</span>
                </div>
                <h3 class="rk-post-card-title">${escapeHtml(project.title)}</h3>
                <p class="rk-post-card-excerpt">${escapeHtml(excerpt)}</p>
                <span class="rk-post-card-more">Projekt ansehen<span aria-hidden="true">→</span></span>
              </div>
            </a>
          </article>`
}

export function injectProjectsIntoProjekte(
  html: string,
  projects: Project[],
  categories: { slug: string; title: string }[],
): string {
  const cards = projects.map(buildProjectCardHtml).join('\n')
  return injectContentListing(html, cards, categories, 'Projekte filtern')
}

export function buildProjectPageContent(project: Project): string {
  const date = formatGermanDate(project.publishedAt)
  const { label: categoryLabel } = resolveProjectCategory(project)
  const image = getProjectHeroImage(project)
  const heroMedia = getPostHeroMedia(project)
  const lead = project.excerpt || project.schema?.blogPosting?.description || ''
  const bodyHtml = normalizeArticleHtml(project.legacyHtml)
  const readTime = project.readTime ? `<span class="rk-blog-read">${escapeHtml(project.readTime)}</span>` : ''

  const coverImage = buildAccessibleImageMarkup({
    src: image,
    width: 1400,
    height: 700,
    sizes: '(max-width: 768px) 100vw, 1200px',
    loading: 'eager',
    media: heroMedia,
    fallbackAlt: project.title,
    idSuffix: `project-cover-${project.id}`,
    standaloneFigure: false,
  })

  const dateMeta = date.iso
    ? `<time datetime="${escapeHtml(date.iso)}">${escapeHtml(date.label)}</time>`
    : ''

  const html = `
    <header class="rk-page-hero rk-page-hero--dark rk-blog-header">
      <div class="rk-inner">
        <a class="rk-blog-back" href="/projekte">← Zurück zu Projekten</a>
        <div class="rk-blog-meta">
          <span class="rk-blog-tag">${escapeHtml(categoryLabel)}</span>
          ${dateMeta}
          ${readTime}
        </div>
        <h1 class="rk-page-title rk-blog-title">${escapeHtml(project.title)}</h1>
        ${lead ? `<p class="rk-page-lead rk-blog-lead">${escapeHtml(lead)}</p>` : ''}
      </div>
    </header>

    <figure class="rk-blog-cover-wrap">
      <div class="rk-inner">
        <div class="rk-blog-cover">
          ${coverImage}
        </div>
      </div>
    </figure>

    <article class="rk-blog-article rk-tone-a">
      <div class="rk-inner">
        <div class="rk-blog-layout">
          <div class="rk-blog-main">
            <div class="rk-blog-content">
              ${bodyHtml}
            </div>

            <footer class="rk-blog-footer">
              <a class="rk-blog-back" href="/projekte">← Alle Projekte</a>
              <a href="/kontakt" class="rk-dot-cta">
                <span class="rk-dot-cta-label">Erstgespräch anfragen</span>
                <div class="dot-ring" aria-hidden="true"><span></span></div>
              </a>
            </footer>
          </div>

          ${getBlogSidebarHtml()}
        </div>
      </div>
    </article>
  `

  return transformAssets(transformLinks(html)).trim()
}

export function getProjectJsonLd(project: Project) {
  return buildPostSchemaJsonLd(project.schema)[0] ?? null
}

export const PROJECT_PAGE_SCRIPTS = ['/js/scroll.js', '/js/readmore.js']

export function getProjectPageData(project: Project) {
  return {
    title: `${project.title} – Rocketory`,
    content: buildProjectPageContent(project),
    scripts: PROJECT_PAGE_SCRIPTS,
    styles: [] as string[],
    jsonLd: getProjectJsonLd(project),
  }
}
