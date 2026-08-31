import fs from 'fs'
import path from 'path'

import { getPayload } from 'payload'

import config from '../payload.config'

const SLUG = 'tus-n-luebbecke-website'

const TITLE = 'TuS N-Lübbecke: Webseite & Ticket-Erlebnis für die 2. Handball-Bundesliga'

const EXCERPT =
  'Custom WordPress-Auftritt für TuS N-Lübbecke: dunkles Club-Design, Ticket-System mit Hallenplan, PDF-Magazin, Mobile-Navigation und Dyn-Livestream-Integration. Gebaut für Fans, Tickets und Saisonkommunikation aus Lübbecke.'

const LEGACY_HTML = `
<p class="rk-blog-intro">Seit 1912 steht der <strong>TuS N-Lübbecke</strong> für Handball in Ostwestfalen, geboren aus dem TuS Nettelstedt, gewachsen zu einem der traditionsreichsten Vereine im deutschen Handball. Heute spielt der Club in der <strong>2. Handball-Bundesliga</strong>, mit der MERKUR Arena im Rücken und einer Fangemeinde, die laut und loyal ist. Für genau dieses Erlebnis brauchte der Verein eine Webseite, die nicht nur News ausspielt, sondern Tickets, Magazin, Livestream und Community zusammenführt. Rocketory hat dafür einen dunklen Club-Auftritt mit rotem Akzent gebaut: WordPress + Elementor als Basis, darüber individuelle Widgets für Navigation, Tickets, Magazin, Instagram und mehr.</p>

<nav class="rk-blog-toc" aria-label="Inhaltsverzeichnis">
  <p class="rk-blog-toc-title">Inhaltsverzeichnis</p>
  <table class="rk-blog-toc-list" role="list">
    <tbody>
      <tr><td><a href="#toc-ziel">Ziel und Ausgangslage</a></td></tr>
      <tr><td><a href="#toc-design">Club-Design: Dunkel, laut, klar</a></td></tr>
      <tr><td><a href="#toc-nav">Desktop-Header und Mobile-Navigation</a></td></tr>
      <tr><td><a href="#toc-tickets">Ticket-Erlebnis mit Hallenplan</a></td></tr>
      <tr><td><a href="#toc-magazin">InTuS: PDF-Magazin als Flipbook</a></td></tr>
      <tr><td><a href="#toc-integrations">Integrationen und Content</a></td></tr>
      <tr><td><a href="#toc-fazit">Ergebnis</a></td></tr>
    </tbody>
  </table>
</nav>

<h2 id="toc-ziel">Ziel und Ausgangslage</h2>
<p>Ein Handballverein in der 2. Bundesliga kommuniziert auf vielen Kanälen gleichzeitig: Spieltag, Tickets, Dauerkarten, Familientickets, Magazin, Livestream, News und Sponsoren. Die Webseite muss das tragen, und zwar so, dass Fans auf dem Handy in Sekunden zum Ticket kommen und Redaktion sowie Geschäftsstelle Inhalte ohne Entwickler-Einsatz pflegen können.</p>
<p>Für TuS N-Lübbecke hieß das konkret: ein starkes Club-Look-and-Feel, Backend-editierbare Saisoninhalte und Schnittstellen zu bestehenden Systemen (Ticket-Onlineshop, Dyn.sport, Instagram).</p>

<h2 id="toc-design">Club-Design: Dunkel, laut, klar</h2>
<p>Das visuelle System setzt auf tiefes Schwarz (<code>#0f0f0f</code>) und den Vereinsakzent Rot (<code>#D70000</code>). So wirkt der Auftritt wie die Arena: dunkel, energetisch, mit klaren Call-to-Actions für Tickets und Livestream. Typografie und Flächen bleiben scharf und sportlich, ohne Baukasten-Look, aber mit Elementor als redaktionellem Fundament.</p>

<h2 id="toc-nav">Desktop-Header und Mobile-Navigation</h2>
<p>Der Desktop-Header bündelt Logo, WordPress-Menü mit Icon-Walker und die zentralen CTAs: Tickets und Dyn „Alle Spiele live“. Beim Scrollen schrumpft die Leiste, bleibt aber greifbar.</p>
<p>Auf dem Smartphone übernimmt eine eigene Sticky-Navigation: Vollbild-Panel, Drill-down für Untermenüs, Tickets- und Dyn-Buttons. Menüpunkte werden über die WordPress-Menüposition gesteuert. Die Geschäftsstelle kann Struktur ändern, ohne Code anzufassen.</p>

<h2 id="toc-tickets">Ticket-Erlebnis mit Hallenplan</h2>
<p>Das Ticket-Widget führt Fans durch Preise, Dauerkarte, Gruppen- und Familientickets sowie LuziTuS. Ein Hallenplan der MERKUR Arena macht Sitzbereiche greifbar. Preise und Texte sind im Backend pflegbar, der Kauf führt in den Ticket-Onlineshop von Lübbecke. So bleibt die Webseite die Informations- und Einstiegsfläche. Der Checkout läuft dort, wo Tickets schon verkauft werden.</p>

<h2 id="toc-magazin">InTuS: PDF-Magazin als Flipbook</h2>
<p>Das Hallenmagazin „InTuS“ erscheint digital als PDF-Flipbook: Desktop mit Blätter-Effekt, Mobile mit klarer Seitenführung, Zoom und Archiv der Ausgaben. Redaktion lädt neue PDFs im WordPress-Backend hoch, die Webseite spielt sie sofort aus. Kurzcode <code>[magazin]</code>, gebaut für Saisonrhythmus statt einmaliger Landingpage.</p>

<h2 id="toc-integrations">Integrationen und Content</h2>
<ul>
  <li><strong>Dyn.sport:</strong> Livestream-CTA für Spiele der 2. HBL</li>
  <li><strong>Ticket-Onlineshop:</strong> Heimtickets und Dauerkarten</li>
  <li><strong>Instagram:</strong> Feed-Einbindung für @tusnluebbecke</li>
  <li><strong>Kontaktformular:</strong> feldkonfigurierbar, SMTP, Spam-Schutz</li>
  <li><strong>FAQ und Sponsoren:</strong> TuS-gestylte Akkordeons und Sponsor-Bereiche (Hauptsponsoren, Pool, Partner)</li>
  <li><strong>News:</strong> WordPress-Beiträge für Spielberichte, Kader und Vereinsnews</li>
</ul>

<h2 id="toc-fazit">Ergebnis</h2>
<p>TuS N-Lübbecke hat einen digitalen Club-Auftritt, der zur Arena passt: schnell zu Tickets, präsent für Fans, pflegbar für die Geschäftsstelle. WordPress bleibt das CMS. Die entscheidenden Erlebnisse (Navigation, Tickets, Magazin, Livestream) sind maßgeschneidert und saisonfest.</p>
<p><strong>Live:</strong> <a href="https://tus-n-luebbecke.de/" class="rk-text-link" target="_blank" rel="noopener noreferrer">tus-n-luebbecke.de</a></p>
`.trim()

const DEFAULT_AUTHOR = {
  name: 'Rocketory Redaktion',
  jobTitle: 'Webdesign, SEO & Entwicklung',
  bio:
    'Die Rocketory Redaktion schreibt über Webdesign, SEO und digitale Auftritte aus der Praxis – aus Bünde für die Region.',
  imageUrl: '/assets/images/ansprechpartner-nicolas-zhigalov.webp',
  profileUrl: '/agentur',
}

async function ensureMedia(payload: Awaited<ReturnType<typeof getPayload>>) {
  const filename = 'tus-n-luebbecke-thumbnail.jpg'
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0]

  const filePath = path.join(process.cwd(), 'public/assets/images', filename)
  if (!fs.existsSync(filePath)) {
    console.warn('Thumbnail fehlt:', filePath)
    return null
  }

  const buffer = fs.readFileSync(filePath)
  return payload.create({
    collection: 'media',
    data: {
      alt: 'TuS N-Lübbecke Webseite auf Laptop – Referenz Rocketory',
      title: 'TuS N-Lübbecke Webseite Thumbnail',
    },
    file: {
      data: buffer,
      mimetype: 'image/jpeg',
      name: filename,
      size: buffer.length,
    },
  })
}

async function main() {
  const payload = await getPayload({ config })

  const categories = await payload.find({
    collection: 'project-categories',
    where: { slug: { equals: 'wordpress' } },
    limit: 1,
  })
  let category = categories.docs[0]
  if (!category) {
    category = await payload.create({
      collection: 'project-categories',
      data: { title: 'WordPress', slug: 'wordpress' },
    })
  }

  const media = await ensureMedia(payload)
  const publishedAt = new Date('2026-08-01T10:00:00.000Z').toISOString()
  const heroUrl = media?.url || '/assets/images/tus-n-luebbecke-thumbnail.jpg'

  const data = {
    title: TITLE,
    slug: SLUG,
    excerpt: EXCERPT,
    legacyHtml: LEGACY_HTML,
    author: DEFAULT_AUTHOR,
    category: category.id,
    readTime: '6 Min. Lesezeit',
    publishedAt,
    status: 'published' as const,
    heroImage: media?.id,
    heroImageUrl: heroUrl,
    seo: {
      metaTitle: 'TuS N-Lübbecke Webseite | Rocketory Referenz',
      metaDescription: EXCERPT.slice(0, 155),
      noIndex: false,
    },
    schema: {
      blogPosting: {
        headline: TITLE,
        description: EXCERPT,
        articleBody: LEGACY_HTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 5000),
        timeRequired: 'PT6M',
        datePublished: publishedAt,
        dateModified: publishedAt,
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

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
