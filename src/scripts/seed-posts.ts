import fs from 'fs'
import path from 'path'

import { getPayload } from 'payload'

import { buildDefaultSchema, parseLegacySchemaJson } from '../lib/build-default-post-schema'
import { type BlogCategorySlug } from '../lib/blog-categories'
import { extractBlogBodyHtml } from '../lib/blog-content'
import { BLOG_SLUGS } from '../lib/legacy-page'
import { backfillMediaTitles, seedBlogCategories } from '../lib/seed-categories'
import config from '../payload.config'

const DEFAULT_AUTHOR = {
  name: 'Rocketory Redaktion',
  jobTitle: 'Webdesign, SEO & Entwicklung',
  bio:
    'Die Rocketory Redaktion schreibt über Webdesign, SEO und digitale Auftritte aus der Praxis – aus Bünde für die Region. ' +
    'Hinter jedem Beitrag steht das Team von Rocketory: Entwickler, Designer und Berater, die täglich Websites für lokale Unternehmen bauen und betreuen.',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  profileUrl: '/agentur',
}

type SeedPost = {
  slug: string
  title: string
  excerpt: string
  category: BlogCategorySlug
  readTime: string
  publishedAt: string
  heroImageUrl?: string
  bodyHtml: string
}

const CATEGORY_MAP: Record<string, SeedPost['category']> = {
  Praxis: 'praxis',
  Design: 'design',
  Technologie: 'technologie',
  'Webdesign & Entwicklung': 'technologie',
}

function extractPostMeta(slug: string): SeedPost | null {
  const filePath = path.join(process.cwd(), 'legacy', 'blog', `${slug}.html`)
  if (!fs.existsSync(filePath)) return null

  const html = fs.readFileSync(filePath, 'utf-8')
  const title =
    html.match(/<h1 class="rk-page-title rk-blog-title">([^<]+)<\/h1>/)?.[1]?.trim() ||
    html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(' – Rocketory', '').trim() ||
    slug
  const excerpt =
    html.match(/<p class="rk-page-lead rk-blog-lead">([^<]+)<\/p>/)?.[1]?.trim() || ''
  const categoryLabel = html.match(/<span class="rk-blog-tag">([^<]+)<\/span>/)?.[1]?.trim() || 'Praxis'
  const readTime = html.match(/<span class="rk-blog-read">([^<]+)<\/span>/)?.[1]?.trim() || ''
  const publishedAt = html.match(/<time datetime="([^"]+)">/)?.[1] || new Date().toISOString()

  let heroImageUrl: string | undefined
  try {
    const jsonMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)
    if (jsonMatch) {
      const schema = JSON.parse(jsonMatch[1]) as { image?: string }
      heroImageUrl = schema.image
    }
  } catch {
    heroImageUrl = undefined
  }

  const bodyHtml = extractBlogBodyHtml(html)

  return {
    slug,
    title: title.replace(/&amp;/g, '&'),
    excerpt: excerpt.replace(/&amp;/g, '&'),
    category: CATEGORY_MAP[categoryLabel] || 'praxis',
    readTime,
    publishedAt: new Date(publishedAt).toISOString(),
    heroImageUrl,
    bodyHtml,
  }
}

async function seed() {
  const payload = await getPayload({ config })

  const categoryIds = await seedBlogCategories(payload)
  await backfillMediaTitles(payload)

  const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@rocketory.de'
  const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD || 'Rocketory2026!'

  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
        name: 'Rocketory Admin',
      },
    })
    console.log(`Admin-Benutzer erstellt: ${adminEmail}`)
  }

  for (const slug of BLOG_SLUGS) {
    const meta = extractPostMeta(slug)
    if (!meta) continue

    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    const html = fs.readFileSync(path.join(process.cwd(), 'legacy', 'blog', `${slug}.html`), 'utf-8')
    const legacySchema = parseLegacySchemaJson(html)

    const data = {
      title: meta.title,
      slug: meta.slug,
      excerpt: meta.excerpt,
      category: categoryIds[meta.category],
      readTime: meta.readTime,
      publishedAt: meta.publishedAt,
      heroImageUrl: meta.heroImageUrl,
      status: 'published' as const,
      legacyHtml: meta.bodyHtml,
      author: DEFAULT_AUTHOR,
      schema: buildDefaultSchema(meta, legacySchema, DEFAULT_AUTHOR),
    }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'posts',
        id: existing.docs[0].id,
        data,
      })
      console.log(`Aktualisiert: ${slug}`)
    } else {
      await payload.create({
        collection: 'posts',
        data,
      })
      console.log(`Erstellt: ${slug}`)
    }
  }

  console.log('Seed abgeschlossen.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
