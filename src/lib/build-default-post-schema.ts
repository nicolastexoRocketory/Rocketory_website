const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rocketory.de'

type LegacySchema = {
  headline?: string
  description?: string
  datePublished?: string
  dateModified?: string
  image?: string
  url?: string
  inLanguage?: string
}

type SeedAuthor = {
  name: string
  bio: string
}

type SeedPostMeta = {
  slug: string
  title: string
  excerpt: string
  readTime: string
  publishedAt: string
  heroImageUrl?: string
  bodyHtml: string
}

const DEFAULT_PUBLISHER = {
  name: 'Rocketory',
  logoUrl: `${SITE_URL}/assets/images/logo_1.png`,
}

const DEFAULT_AUTHOR_SAME_AS = [
  { url: 'https://www.instagram.com/rocketory' },
  { url: 'https://www.youtube.com/@rocketory' },
  { url: 'https://www.linkedin.com/company/rocketory' },
]

function parseReadTimeIso(readTime: string): string {
  const match = readTime.match(/(\d+)/)
  return match ? `PT${match[1]}M` : 'PT5M'
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function toDateOnly(value?: string): string | undefined {
  if (!value) return undefined
  return value.slice(0, 10)
}

export function buildDefaultSchema(
  meta: SeedPostMeta,
  legacySchema: LegacySchema | null,
  author: SeedAuthor,
) {
  const canonicalUrl = `${SITE_URL}/blog/${meta.slug}`
  const published =
    toDateOnly(legacySchema?.datePublished) || toDateOnly(meta.publishedAt) || undefined
  const modified =
    toDateOnly(legacySchema?.dateModified) || published

  return {
    blogPosting: {
      headline: legacySchema?.headline || meta.title,
      description: legacySchema?.description || meta.excerpt,
      articleBody: htmlToPlainText(meta.bodyHtml),
      timeRequired: parseReadTimeIso(meta.readTime),
      datePublished: published,
      dateModified: modified,
      image: meta.heroImageUrl || legacySchema?.image || '',
      mainEntityOfPage: legacySchema?.url?.replace(/\.html$/, '') || canonicalUrl,
      inLanguage: 'de-DE',
    },
    author: {
      name: author.name,
      description: author.bio,
      sameAs: DEFAULT_AUTHOR_SAME_AS,
    },
    publisher: DEFAULT_PUBLISHER,
  }
}

export function parseLegacySchemaJson(html: string): LegacySchema | null {
  try {
    const jsonMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[1]) as LegacySchema
  } catch {
    return null
  }
}
