import type { Post } from '@/payload-types'

import { buildFeaturedFocusCardHtml } from './posts'
import { getPayloadClient } from './payload'

export type FeaturedPostSection = {
  title: string
  titleEm?: string | null
  intro?: string | null
  post: Post
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resolveFeaturedPost(post: Post | number | null | undefined): Post | null {
  if (!post || typeof post === 'number') return null
  if (post.status !== 'published') return null
  return post
}

export async function getFeaturedPostSection(): Promise<FeaturedPostSection | null> {
  const payload = await getPayloadClient()
  const homepage = await payload.findGlobal({
    slug: 'homepage',
    depth: 2,
  })

  const section = homepage.featuredPostSection
  const post = resolveFeaturedPost(section?.post)
  if (!post || !section?.title) return null

  return {
    title: section.title,
    titleEm: section.titleEm,
    intro: section.intro,
    post,
  }
}

function buildFeaturedTitleHtml(title: string, titleEm?: string | null): string {
  const lineHtml = escapeHtml(title.trim())

  if (titleEm) {
    return `${lineHtml}<br><em>${escapeHtml(titleEm)}</em>`
  }

  return lineHtml
}

function buildFeaturedPostSectionHtml(section: FeaturedPostSection): string {
  const titleHtml = buildFeaturedTitleHtml(section.title, section.titleEm)
  const introHtml = section.intro ? escapeHtml(section.intro) : ''
  const card = buildFeaturedFocusCardHtml(section.post)

  return `
    <section class="rk-section rk-featured rk-featured-focus rk-tone-orange" id="beitrag-im-fokus">
      <div class="rk-inner">
        <div class="rk-featured-layout">
          <div class="rk-featured-intro">
            <p class="rk-featured-kicker">Blog · Beitrag im Fokus</p>
            <h2 class="rk-h2">${titleHtml}</h2>
            ${introHtml ? `<p class="rk-featured-desc">${introHtml}</p>` : ''}
          </div>
          ${card}
        </div>
      </div>
    </section>`
}

const FEATURED_POST_SECTION_REGEX =
  /<section class="rk-section rk-featured rk-featured-focus rk-tone-orange" id="beitrag-im-fokus"[\s\S]*?<\/section>/

export function injectFeaturedPostSection(html: string, section: FeaturedPostSection | null): string {
  if (!section) {
    return html.replace(FEATURED_POST_SECTION_REGEX, '')
  }

  return html.replace(FEATURED_POST_SECTION_REGEX, buildFeaturedPostSectionHtml(section))
}
