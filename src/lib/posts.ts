import type { Post } from '@/payload-types'

import { buildBottomGalleryHtml } from './bottom-gallery'
import { buildPostSchemaJsonLd } from './build-post-schema-jsonld'
import { resolveArticleBodyHtml } from './content-sections'
import { normalizeExternalUrl } from './normalize-external-url'
import {
  getBlogSidebarHtml,
  normalizeBlogArticleHtml,
} from './blog-content'
import { injectContentListing } from './content-listing'
import { buildAccessibleImageMarkup, getPostHeroMedia } from './media-a11y'
import { resolvePostCategory } from './post-category'
import { getPayloadClient } from './payload'
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

export function getPostHeroImage(post: Post): string {
  if (post.heroImage && typeof post.heroImage === 'object' && post.heroImage.url) {
    return normalizeExternalUrl(post.heroImage.url)
  }

  const fallback = post.heroImageUrl || post.schema?.blogPosting?.image || DEFAULT_HERO
  return normalizeExternalUrl(fallback)
}

export async function getPublishedPosts() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })

  return result.docs
}

export async function getBlogCategories() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    sort: 'title',
    limit: 100,
  })

  return result.docs.map((category) => ({
    slug: category.slug,
    title: category.title,
  }))
}

export async function getPublishedPostBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] ?? null
}

export async function getPublishedPostSlugs() {
  const posts = await getPublishedPosts()
  return posts.map((post) => post.slug)
}

export function buildPostCardHtml(post: Post): string {
  const date = formatGermanDate(post.publishedAt)
  const image = getPostHeroImage(post)
  const heroMedia = getPostHeroMedia(post)
  const excerpt = post.excerpt || post.schema?.blogPosting?.description || ''
  const { slug: categorySlug, label: categoryLabel } = resolvePostCategory(post)

  const dateHtml = date.iso
    ? `<time datetime="${escapeHtml(date.iso)}">${escapeHtml(date.label)}</time>`
    : ''

  const imageMarkup = buildAccessibleImageMarkup({
    src: image,
    width: 1200,
    height: 675,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
    media: heroMedia,
    fallbackAlt: post.title,
    idSuffix: `card-${post.id}`,
    standaloneFigure: false,
  })

  return `
          <article class="rk-post-card" data-category="${escapeHtml(categorySlug)}">
            <a class="rk-post-card-link" href="/blog/${escapeHtml(post.slug)}">
              <figure class="rk-post-card-media">
                ${imageMarkup}
              </figure>
              <div class="rk-post-card-body">
                <div class="rk-post-card-meta">
                  ${dateHtml}
                  <span class="rk-post-card-cat">${escapeHtml(categoryLabel)}</span>
                </div>
                <h3 class="rk-post-card-title">${escapeHtml(post.title)}</h3>
                <p class="rk-post-card-excerpt">${escapeHtml(excerpt)}</p>
                <span class="rk-post-card-more">Weiterlesen<span aria-hidden="true">→</span></span>
              </div>
            </a>
          </article>`
}

export function buildFeaturedFocusCardHtml(post: Post): string {
  const date = formatGermanDate(post.publishedAt)
  const image = getPostHeroImage(post)
  const heroMedia = getPostHeroMedia(post)
  const excerpt = post.excerpt || post.schema?.blogPosting?.description || ''
  const { label: categoryLabel } = resolvePostCategory(post)
  const readTime = post.readTime
    ? `<span class="rk-featured-read">${escapeHtml(post.readTime)}</span>`
    : ''

  const dateHtml = date.iso
    ? `<time datetime="${escapeHtml(date.iso)}">${escapeHtml(date.label)}</time>`
    : ''

  const imageMarkup = buildAccessibleImageMarkup({
    src: image,
    width: 1200,
    height: 800,
    sizes: '(max-width: 768px) 100vw, 480px',
    media: heroMedia,
    fallbackAlt: post.title,
    idSuffix: `focus-${post.id}`,
    standaloneFigure: false,
  })

  return `
        <article class="rk-featured-card">
          <a class="rk-featured-link" href="/blog/${escapeHtml(post.slug)}">
            <figure class="rk-featured-media">
              ${imageMarkup}
            </figure>
            <div class="rk-featured-body">
              <div class="rk-featured-meta">
                <span class="rk-featured-cat">${escapeHtml(categoryLabel)}</span>
                ${dateHtml}
                ${readTime}
              </div>
              <h3 class="rk-featured-title">${escapeHtml(post.title)}</h3>
              <p class="rk-featured-excerpt">${escapeHtml(excerpt)}</p>
              <span class="rk-featured-more">
                <span>Beitrag lesen</span>
                <span class="dot-ring" aria-hidden="true"><span></span></span>
              </span>
            </div>
          </a>
        </article>`
}

export function buildFeaturedSlideHtml(post: Post): string {
  const date = formatGermanDate(post.publishedAt)
  const image = getPostHeroImage(post)
  const heroMedia = getPostHeroMedia(post)
  const excerpt = post.excerpt || post.schema?.blogPosting?.description || ''
  const { label: categoryLabel } = resolvePostCategory(post)
  const readTime = post.readTime
    ? `<span class="rk-featured-read">${escapeHtml(post.readTime)}</span>`
    : ''

  const dateHtml = date.iso
    ? `<time datetime="${escapeHtml(date.iso)}">${escapeHtml(date.label)}</time>`
    : ''

  const imageMarkup = buildAccessibleImageMarkup({
    src: image,
    width: 1200,
    height: 800,
    sizes: '(max-width: 768px) 100vw, 50vw',
    media: heroMedia,
    fallbackAlt: post.title,
    idSuffix: `featured-${post.id}`,
    standaloneFigure: false,
  })

  return `
              <article class="rk-featured-card rk-featured-slide" data-rk-blog-slide>
                <a class="rk-featured-link" href="/blog/${escapeHtml(post.slug)}">
                  <figure class="rk-featured-media">
                    ${imageMarkup}
                  </figure>
                  <div class="rk-featured-body">
                    <div class="rk-featured-meta">
                      <span class="rk-featured-cat">${escapeHtml(categoryLabel)}</span>
                      ${dateHtml}
                      ${readTime}
                    </div>
                    <h3 class="rk-featured-title">${escapeHtml(post.title)}</h3>
                    <p class="rk-featured-excerpt">${escapeHtml(excerpt)}</p>
                    <span class="rk-featured-more">
                      <span>Beitrag lesen</span>
                      <span class="dot-ring" aria-hidden="true"><span></span></span>
                    </span>
                  </div>
                </a>
              </article>`
}

export function injectPostsIntoHomepage(html: string, posts: Post[]): string {
  const featuredPosts = posts.slice(0, 6)
  const slides = featuredPosts.map(buildFeaturedSlideHtml).join('\n')
  const pageCount = Math.max(1, Math.ceil(featuredPosts.length / 3))

  return html
    .replace(
      /(<div class="rk-featured-slider-track" data-rk-blog-slider-track>)[\s\S]*?(<\/div>\s*\n\s*<\/div>\s*\n\s*<div class="rk-featured-slider-nav">)/,
      `$1\n${slides}\n          $2`,
    )
    .replace(
      /(<span class="rk-featured-slider-count" data-rk-blog-slider-count[^>]*>)[^<]*/,
      `$11 / ${pageCount}`,
    )
}

export type BlogCategoryFilter = {
  slug: string
  title: string
}

export function injectPostsIntoBlog(
  html: string,
  posts: Post[],
  categories: BlogCategoryFilter[],
): string {
  const cards = posts.map(buildPostCardHtml).join('\n')
  return injectContentListing(html, cards, categories, 'Beiträge filtern')
}

/** @deprecated Use injectPostsIntoBlog */
export function injectPostsIntoReferenzen(
  html: string,
  posts: Post[],
  categories: BlogCategoryFilter[],
): string {
  return injectPostsIntoBlog(html, posts, categories)
}

export function buildBlogPostPageContent(post: Post): string {
  const date = formatGermanDate(post.publishedAt)
  const { label: categoryLabel } = resolvePostCategory(post)
  const image = getPostHeroImage(post)
  const heroMedia = getPostHeroMedia(post)
  const lead = post.excerpt || post.schema?.blogPosting?.description || ''
  const bodyHtml = normalizeArticleHtml(
    resolveArticleBodyHtml({
      contentSections: post.contentSections,
      contentIntro: post.contentIntro,
      legacyHtml: post.legacyHtml,
    }),
  )
  const galleryHtml = buildBottomGalleryHtml(post, 'post-gallery')
  const readTime = post.readTime ? `<span class="rk-blog-read">${escapeHtml(post.readTime)}</span>` : ''

  const coverImage = buildAccessibleImageMarkup({
    src: image,
    width: 1400,
    height: 700,
    sizes: '(max-width: 768px) 100vw, 1200px',
    loading: 'eager',
    media: heroMedia,
    fallbackAlt: post.title,
    idSuffix: `cover-${post.id}`,
    standaloneFigure: false,
  })

  const dateMeta = date.iso
    ? `<time datetime="${escapeHtml(date.iso)}">${escapeHtml(date.label)}</time>`
    : ''

    const html = `
    <header class="rk-page-hero rk-page-hero--dark rk-blog-header">
      <div class="rk-inner">
        <a class="rk-blog-back" href="/blog">← Zurück zum Blog</a>
        <div class="rk-blog-meta">
          <span class="rk-blog-tag">${escapeHtml(categoryLabel)}</span>
          ${dateMeta}
          ${readTime}
        </div>
        <h1 class="rk-page-title rk-blog-title">${escapeHtml(post.title)}</h1>
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

            ${galleryHtml}

            <footer class="rk-blog-footer">
              <a class="rk-blog-back" href="/blog">← Alle Beiträge</a>
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

export function getBlogPostJsonLd(post: Post) {
  return buildPostSchemaJsonLd(post.schema)[0] ?? null
}

export const BLOG_PAGE_SCRIPTS = ['/js/scroll.js', '/js/readmore.js', '/js/blog-slider.js']

export function getBlogPostPageData(post: Post) {
  return {
    title: `${post.title}, Rocketory`,
    content: buildBlogPostPageContent(post),
    scripts: BLOG_PAGE_SCRIPTS,
    styles: [] as string[],
    jsonLd: getBlogPostJsonLd(post),
  }
}
