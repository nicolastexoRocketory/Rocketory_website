import fs from 'fs'
import path from 'path'

import { getPayload } from 'payload'
import type { Media } from '../payload-types'

import config from '../payload.config'

const SLUG = 'fairflock-produktions-ticketsystem'

const TITLE = 'FairFlock: Internes Produktions-Ticketsystem'

const EXCERPT =
  'Web-App für die Produktions-Organisation der FairFlock GmbH: Aufträge, Kanban, Dashboard, Showroom, Tracking und PWA. Gebaut mit Next.js und Payload – für Druck, Stick, Bank-Banner und WMD aus Bünde.'

const DEFAULT_AUTHOR = {
  name: 'Rocketory Redaktion',
  jobTitle: 'Webdesign, SEO & Entwicklung',
  bio:
    'Die Rocketory Redaktion schreibt über Webdesign, SEO und digitale Auftritte aus der Praxis – aus Bünde für die Region.',
  imageUrl: '/assets/images/ansprechpartner-nicolas-zhigalov.webp',
  profileUrl: '/agentur',
}

function buildLegacyHtml(detailImageUrl: string, appImageUrl: string): string {
  return `
<p class="rk-blog-intro">Die <strong>FairFlock GmbH</strong> steuert in Bünde Druck, Stick, Bank-Banner und WMD. Täglich laufen Aufträge parallel: Ware bestellen, Veredelung planen, Deadlines halten, Tracking setzen, Showroom füllen. Excel und Chat-Threads reichten dafür nicht mehr. Rocketory hat deshalb ein <strong>internes Produktions-Ticketsystem</strong> gebaut: eine Web-App, die den Shopfloor digital abbildet, installierbar als PWA und klar genug für den Alltag in der Produktion.</p>

<nav class="rk-blog-toc" aria-label="Inhaltsverzeichnis">
  <p class="rk-blog-toc-title">Inhaltsverzeichnis</p>
  <table class="rk-blog-toc-list" role="list">
    <tbody>
      <tr><td><a href="#toc-ziel">Ziel und Ausgangslage</a></td></tr>
      <tr><td><a href="#toc-auftraege">Aufträge im Zentrum</a></td></tr>
      <tr><td><a href="#toc-views">Dashboard, Kanban, Showroom</a></td></tr>
      <tr><td><a href="#toc-ops">Tracking, Rollen, Mitteilungen</a></td></tr>
      <tr><td><a href="#toc-tech">Technik und PWA</a></td></tr>
      <tr><td><a href="#toc-fazit">Ergebnis</a></td></tr>
    </tbody>
  </table>
</nav>

<h2 id="toc-ziel">Ziel und Ausgangslage</h2>
<p>Produktion bei FairFlock heißt viele kleine Entscheidungen am Tag: Welche Aufträge sind kritisch? Wer übernimmt Stick, wer Druck? Ist die Ware schon bestellt? Wann geht der Versand raus? Das System sollte genau diese Fragen beantworten – ohne Schulungsmarathon, ohne fremde SaaS-Logik, die nicht zur Textilveredelung passt.</p>
<p>Anforderung war klar: ein internes Werkzeug für Mitarbeiter und Admins, mobil nutzbar in der Halle, mit FairFlock-Branding und Datenschutz (Login, Rollen, noindex).</p>

<h2 id="toc-auftraege">Aufträge im Zentrum</h2>
<p>Jeder Auftrag trägt Status, Deadline, Veredelungsart, Priorität, Zuweisung, Kundenbezug und Verlauf. Veredelungsarten decken den FairFlock-Alltag ab: Druck, Stick, Bank-Banner, Sublimation, WMD. Status und Deadlines steuern, was heute wirklich zählt. Versionierung hält Änderungen nachvollziehbar – wichtig, wenn mehrere Personen am selben Ticket arbeiten.</p>

<figure class="rk-media-figure">
  <img src="${detailImageUrl}" alt="FairFlock Ticketsystem: Auftragsdetail mit Basisdaten, Team-Hinweis und Veredelungsart Stick" width="1024" height="768" loading="lazy" decoding="async" />
  <figcaption class="rk-media-caption">Auftragsdetail auf dem Tablet: Basisdaten, Priorität, Zuweisung und Veredelungsart auf einen Blick.</figcaption>
</figure>

<h2 id="toc-views">Dashboard, Kanban, Showroom</h2>
<ul>
  <li><strong>Dashboard:</strong> offene Aufträge, Suche, Filter nach Veredelungsart, Auslastung und Wochenfortschritt</li>
  <li><strong>Kanban:</strong> visuelle Steuerung über Status-Spalten statt langer Listen</li>
  <li><strong>Showroom:</strong> fertige Arbeiten sichtbar machen – für Team und interne Abstimmung</li>
  <li><strong>Archiv &amp; Papierkorb:</strong> abgeschlossene und gelöschte Aufträge bleiben kontrolliert erreichbar</li>
</ul>

<h2 id="toc-ops">Tracking, Rollen, Mitteilungen</h2>
<p>Trackingnummern werden erkannt und dem Carrier zugeordnet (DHL, UPS, GLS, DPD) – mit Direktlink zur Carrier-Seite. Kunden und Lieferanten liegen im System, Admins verwalten Nutzer. Mitteilungen halten das Team auf dem Laufenden. Login mit optionaler 2FA schützt die Produktionsdaten.</p>

<h2 id="toc-tech">Technik und PWA</h2>
<p>Stack: <strong>Next.js (App Router)</strong>, <strong>Payload CMS 3</strong>, PostgreSQL in Produktion, Tailwind. Die App ist als Progressive Web App installierbar: eigener Homescreen-Eintrag, Standalone-Modus, Install-Prompt für Android und iOS-Anleitung. So liegt das Ticketsystem dort, wo das Team arbeitet – nicht nur im Browser-Tab.</p>

<figure class="rk-media-figure">
  <img src="${appImageUrl}" alt="FairFlock Ticketsystem als Web-App auf dem Tablet – Kanban-Board mit Produktionsaufträgen" width="1024" height="768" loading="lazy" decoding="async" />
  <figcaption class="rk-media-caption">Die Web-App im Einsatz: Kanban auf dem Tablet – installierbar als PWA, gebaut für den Produktionsalltag.</figcaption>
</figure>

<h2 id="toc-fazit">Ergebnis</h2>
<p>FairFlock steuert Produktion digital: Aufträge, Prioritäten, Versand und Showroom in einem System. Rocketory liefert damit nicht nur Webseiten, sondern Software, die den Betriebsalltag der Dachmarke trägt – aus demselben Haus, für denselben Qualitätsanspruch.</p>
<p><strong>Marke:</strong> <a href="https://www.fairflock.de/" class="rk-text-link" target="_blank" rel="noopener noreferrer">fairflock.de</a> · Internes System (Login erforderlich)</p>
`.trim()
}

async function ensureCategory(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await payload.find({
    collection: 'project-categories',
    where: { slug: { equals: 'web-app' } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0]

  return payload.create({
    collection: 'project-categories',
    data: { title: 'Web-App', slug: 'web-app' },
  })
}

async function upsertMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  opts: {
    filename: string
    alt: string
    title: string
  },
): Promise<Media | null> {
  const filePath = path.join(process.cwd(), 'public/assets/images', opts.filename)
  if (!fs.existsSync(filePath)) {
    console.warn('Datei fehlt:', filePath)
    return null
  }

  const buffer = fs.readFileSync(filePath)
  const webpName = opts.filename.replace(/\.jpe?g$/i, '.webp')
  const existing = await payload.find({
    collection: 'media',
    where: {
      or: [{ filename: { equals: opts.filename } }, { filename: { equals: webpName } }],
    },
    limit: 1,
  })

  const file = {
    data: buffer,
    mimetype: 'image/jpeg' as const,
    name: opts.filename,
    size: buffer.length,
  }
  const data = { alt: opts.alt, title: opts.title }

  if (existing.docs[0]) {
    return payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      data,
      file,
    })
  }

  return payload.create({
    collection: 'media',
    data,
    file,
  })
}

async function main() {
  const payload = await getPayload({ config })

  const category = await ensureCategory(payload)

  const thumb = await upsertMedia(payload, {
    filename: 'fairflock-ticketsystem-thumbnail.jpg',
    alt: 'FairFlock Produktions-Ticketsystem auf dem Tablet – Kanban-Board mit Aufträgen',
    title: 'FairFlock Ticketsystem Thumbnail',
  })

  const detail = await upsertMedia(payload, {
    filename: 'fairflock-ticketsystem-testauftrag.jpg',
    alt: 'FairFlock Ticketsystem: Auftragsdetail mit Basisdaten und Veredelungsart',
    title: 'FairFlock Ticketsystem Auftragsdetail',
  })

  const publishedAt = new Date('2026-08-20T10:00:00.000Z').toISOString()
  const heroUrl = thumb?.url || '/assets/images/fairflock-ticketsystem-thumbnail.jpg'
  const detailUrl = detail?.url || '/assets/images/fairflock-ticketsystem-testauftrag.jpg'
  const legacyHtml = buildLegacyHtml(detailUrl, heroUrl)

  const data = {
    title: TITLE,
    slug: SLUG,
    excerpt: EXCERPT,
    legacyHtml,
    author: DEFAULT_AUTHOR,
    category: category.id,
    readTime: '5 Min. Lesezeit',
    publishedAt,
    status: 'published' as const,
    heroImage: thumb?.id,
    heroImageUrl: heroUrl,
    seo: {
      metaTitle: 'FairFlock Ticketsystem | Rocketory Referenz',
      metaDescription: EXCERPT.slice(0, 155),
      noIndex: false,
    },
    schema: {
      blogPosting: {
        headline: TITLE,
        description: EXCERPT,
        articleBody: legacyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 5000),
        timeRequired: 'PT5M',
        datePublished: publishedAt,
        dateModified: new Date().toISOString(),
        image: typeof heroUrl === 'string' && heroUrl.startsWith('http') ? heroUrl : `https://rocketory.de${heroUrl}`,
        mainEntityOfPage: `https://rocketory.de/projekte/${SLUG}`,
        inLanguage: 'de-DE',
      },
      author: {
        name: DEFAULT_AUTHOR.name,
        description: DEFAULT_AUTHOR.bio,
        sameAs: [{ url: 'https://rocketory.de/agentur' }],
      },
      publisher: {
        name: 'Rocketory',
        logoUrl: 'https://rocketory.de/assets/images/logo_1.png',
      },
    },
  }

  const existing = await payload.find({
    collection: 'projects',
    where: { slug: { equals: SLUG } },
    limit: 1,
  })

  try {
    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: 'projects',
        id: existing.docs[0].id,
        data,
      })
      console.log('Updated project:', updated.slug, updated.id)
    } else {
      const created = await payload.create({
        collection: 'projects',
        data,
      })
      console.log('Created project:', created.slug, created.id)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('revalidatePath')) {
      console.warn('Hinweis: Revalidate außerhalb von Next – Projekt trotzdem geschrieben.')
      console.log('Project slug:', SLUG)
    } else {
      throw error
    }
  }

  console.log('Hero:', heroUrl)
  console.log('Detail:', detailUrl)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
