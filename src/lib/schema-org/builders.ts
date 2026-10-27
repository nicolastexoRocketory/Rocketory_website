import type { Post, Project } from '@/payload-types'

import { HOME_PAGE_DESCRIPTION, HOME_PAGE_TITLE, SITE_URL } from '@/lib/metadata'
import { getPostHeroImage } from '@/lib/posts'
import { getProjectHeroImage } from '@/lib/projects'
import { MAIN_SITE_NAV } from '@/lib/site-schema'

import { buildPostSchemaJsonLd } from '../build-post-schema-jsonld'
import {
  CORE_SERVICES,
  GEO_BUNDE,
  LEGAL_ADDRESS,
  LOCAL_BUSINESS_ID,
  MAPS_URL,
  META_AGENTUR_BUENDE,
  META_STANDORTE,
  META_WEBDESIGN,
  META_SEO,
  META_WARTUNG,
  ORG_ADDRESS,
  ORG_BRAND,
  ORG_EMAIL,
  ORG_PHONE,
  ORG_LEGAL_NAME,
  ORG_SAME_AS,
  ORGANIZATION_ID,
  PLACE_BUNDE_ID,
  SERVICE_AREA_CITIES,
  SITE_DESCRIPTION,
  WEBSITE_ID,
} from './constants'

type SchemaNode = Record<string, unknown>

function serializeGraph(nodes: SchemaNode[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes,
  }).replace(/</g, '\\u003c')
}

export function serializeSchemaGraph(nodes: SchemaNode[]): string {
  return serializeGraph(nodes)
}

function pageId(path: string): string {
  return path === '/' ? `${SITE_URL}/#webpage` : `${SITE_URL}${path}#webpage`
}

function buildBreadcrumbTrail(crumbs: { name: string; path: string }[]): SchemaNode {
  const last = crumbs[crumbs.length - 1]
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}${last.path === '/' ? '' : last.path}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path === '/' ? '' : crumb.path}`,
    })),
  }
}

function buildBreadcrumb(path: string, currentName: string): SchemaNode {
  const crumbs = [{ name: 'Startseite', path: '/' }]
  if (path !== '/') {
    crumbs.push({ name: currentName, path })
  }
  return buildBreadcrumbTrail(crumbs)
}

function buildFaqPage(path: string, faqs: { question: string; answer: string }[]): SchemaNode {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}${path}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function buildPlaceBuende(): SchemaNode {
  return {
    '@type': 'Place',
    '@id': PLACE_BUNDE_ID,
    name: 'Bünde',
    alternateName: 'Zigarrenstadt Bünde',
    description:
      'Bünde ist eine Mittelstadt mit rund 47.500 Einwohnern im Kreis Herford (Ostwestfalen-Lippe, NRW), bekannt als Zigarrenstadt. Rocketory hat hier sein einziges Kundenbüro (Zimmerstr. 16, 32257 Bünde) und betreut Unternehmen in OWL.',
    geo: GEO_BUNDE,
    address: ORG_ADDRESS,
    containedInPlace: [
      {
        '@type': 'AdministrativeArea',
        name: 'Kreis Herford',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Ostwestfalen-Lippe',
      },
      {
        '@type': 'State',
        name: 'Nordrhein-Westfalen',
      },
    ],
  }
}

function serviceAreaNodes() {
  return [
    ...SERVICE_AREA_CITIES.map((name) => ({ '@type': 'City' as const, name })),
    { '@type': 'AdministrativeArea' as const, name: 'Ostwestfalen-Lippe' },
    { '@type': 'AdministrativeArea' as const, name: 'Kreis Herford' },
    { '@type': 'State' as const, name: 'Nordrhein-Westfalen' },
  ]
}

function baseWebPage(
  path: string,
  name: string,
  description: string,
  type: string = 'WebPage',
): SchemaNode {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`

  return {
    '@type': type,
    '@id': pageId(path),
    url,
    name,
    description,
    inLanguage: 'de-DE',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
  }
}

export function buildGlobalSchemaNodes(): SchemaNode[] {
  return [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: ORG_BRAND,
      legalName: ORG_LEGAL_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/images/logo_1.png`,
      },
      image: `${SITE_URL}/assets/images/team-rocketory.webp`,
      email: ORG_EMAIL,
      telephone: ORG_PHONE,
      address: LEGAL_ADDRESS,
      location: { '@id': LOCAL_BUSINESS_ID },
      sameAs: ORG_SAME_AS,
    },
    {
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': LOCAL_BUSINESS_ID,
      name: ORG_BRAND,
      alternateName: 'Rocketory, Webdesign Bünde',
      legalName: ORG_LEGAL_NAME,
      url: SITE_URL,
      image: [
        `${SITE_URL}/assets/images/buende/buende-a30.webp`,
        `${SITE_URL}/assets/images/team-rocketory.webp`,
      ],
      email: ORG_EMAIL,
      telephone: ORG_PHONE,
      address: ORG_ADDRESS,
      geo: GEO_BUNDE,
      hasMap: MAPS_URL,
      parentOrganization: { '@id': ORGANIZATION_ID },
      areaServed: serviceAreaNodes(),
      priceRange: '€€',
      knowsAbout: [
        'Webdesign',
        'SEO',
        'WordPress',
        'Next.js',
        'Payload CMS',
        'Lokales SEO OWL',
        'Webdesign Bünde',
        'Zigarrenstadt Bünde',
      ],
      foundingLocation: { '@id': PLACE_BUNDE_ID },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: ORG_BRAND,
      description: SITE_DESCRIPTION,
      inLanguage: 'de-DE',
      publisher: { '@id': ORGANIZATION_ID },
      hasPart: MAIN_SITE_NAV.map((item) => ({
        '@type': 'WebPage',
        '@id': `${SITE_URL}${item.path}#webpage`,
        name: item.name,
        url: `${SITE_URL}${item.path}`,
        description: item.description,
        isPartOf: { '@id': WEBSITE_ID },
      })),
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#main-navigation`,
      name: 'Hauptnavigation',
      itemListElement: MAIN_SITE_NAV.map((item, index) => ({
        '@type': 'SiteNavigationElement',
        position: index + 1,
        name: item.name,
        description: item.description,
        url: `${SITE_URL}${item.path}`,
      })),
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#services`,
      name: 'Leistungen',
      itemListElement: CORE_SERVICES.map((service, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
          provider: { '@id': LOCAL_BUSINESS_ID },
          areaServed: serviceAreaNodes(),
        },
      })),
    },
    buildPlaceBuende(),
  ]
}

export function buildGlobalSchemaScript(): string {
  return serializeGraph(buildGlobalSchemaNodes())
}

export function buildHomePageSchema(): SchemaNode[] {
  return [
    {
      ...baseWebPage('/', HOME_PAGE_TITLE, HOME_PAGE_DESCRIPTION),
      '@type': 'WebPage',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/images/team-raketenstart.webp`,
      },
      mainEntity: { '@id': LOCAL_BUSINESS_ID },
    },
    buildBreadcrumb('/', 'Startseite'),
  ]
}

export function buildAgenturPageSchema(): SchemaNode[] {
  const description =
    'Webdesign-Team aus Bünde mit festem Standort in Ostwestfalen-Lippe, persönlich, ehrlich, ohne Verkaufsdruck.'

  return [
    {
      ...baseWebPage('/agentur', 'Agentur, Rocketory', description, 'AboutPage'),
      mainEntity: { '@id': ORGANIZATION_ID },
    },
    buildBreadcrumb('/agentur', 'Agentur'),
    buildPlaceBuende(),
  ]
}

export function buildAgenturBuendePageSchema(): SchemaNode[] {
  const description = META_AGENTUR_BUENDE

  const faqs = [
    {
      question: 'Wie schnell meldet sich Rocketory zurück?',
      answer:
        'In der Regel innerhalb von 24 Stunden, persönlich, nicht automatisiert. Du sprichst direkt mit Menschen, die dein Projekt kennen. Kontakt: https://rocketory.de/kontakt',
    },
    {
      question: 'Arbeitet Rocketory nur regional?',
      answer:
        'Unser Herz schlägt in Bünde, wir kennen den Markt vor Ort. Projekte begleiten wir aber auch per Video und digital, wenn das für dich passt. Beispiele: https://rocketory.de/projekte',
    },
    {
      question: 'Was passiert nach dem Launch?',
      answer:
        'Wir bleiben an deiner Seite: Wartung, Updates und persönlicher Support sorgen dafür, dass deine Webseite zuverlässig läuft, während du dein Business führst.',
    },
    {
      question: 'Wie lange läuft ein Monats-Abo?',
      answer:
        'Alle monatlichen Pakete, inklusive Wartung & Sicherheit, haben eine Mindestlaufzeit von 24 Monaten. Danach ist monatlich kündbar. Details im Erstgespräch: https://rocketory.de/kontakt',
    },
    {
      question: 'Gibt es versteckte Kosten?',
      answer:
        'Nein. Klare Angebote, nachvollziehbare Preise und ehrliche Empfehlungen, alles inklusive, keine versteckten Extras.',
    },
    {
      question: 'Bin ich an eine anonyme Agentur gebunden?',
      answer:
        'Rocketory ist eine Unit der FairFlock GmbH, Marketing über unsere Schwester-Agentur Viralista. Kein Ein-Mann-Setup ohne Rückhalt. Du arbeitest mit einer Struktur, die Verantwortung trägt.',
    },
  ]

  return [
    {
      ...baseWebPage(
        '/agentur/buende',
        'Webdesign-Agentur in Bünde (OWL), Rocketory',
        description,
        'AboutPage',
      ),
      mainEntity: { '@id': LOCAL_BUSINESS_ID },
      about: { '@id': PLACE_BUNDE_ID },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/images/buende/buende-a30.webp`,
      },
      significantLink: [`${SITE_URL}/standorte`, `${SITE_URL}/kontakt`, `${SITE_URL}/angebote`],
    },
    buildBreadcrumbTrail([
      { name: 'Startseite', path: '/' },
      { name: 'Agentur', path: '/agentur' },
      { name: 'Bünde', path: '/agentur/buende' },
    ]),
    buildPlaceBuende(),
    buildFaqPage('/agentur/buende', faqs),
  ]
}

export function buildStandortePageSchema(): SchemaNode[] {
  const description = META_STANDORTE

  const faqs = [
    {
      question: 'Wie viele Standorte hat Rocketory?',
      answer:
        'Einen: das Büro in Bünde (Zimmerstraße 16). Die Orte auf der Standorte-Seite beschreiben das Einsatzgebiet, keine weiteren Büros. Details: https://rocketory.de/agentur/buende',
    },
    {
      question: 'Betreut ihr auch Kunden außerhalb von Bünde?',
      answer:
        'Ja. Schwerpunkt ist OWL (unter anderem Herford, Enger, Löhne, Bad Oeynhausen, Bielefeld). Zusammenarbeit funktioniert online und, wenn sinnvoll, vor Ort.',
    },
    {
      question: 'Warum steht „Standorte“ auf der Webseite?',
      answer:
        'Damit klar ist, wo wir sitzen und wo wir arbeiten: ein physischer Standort in Bünde und ein definiertes Einsatzgebiet in Ostwestfalen-Lippe. Details: https://rocketory.de/agentur/buende',
    },
    {
      question: 'Wen kontaktiere ich bei Fragen aus Herford oder Bielefeld?',
      answer:
        'Denselben Ansprechpartner wie in Bünde: beratung@rocketory.de oder https://rocketory.de/kontakt. Büro: Zimmerstraße 16, 32257 Bünde.',
    },
    {
      question: 'Seid ihr eine Remote-Agentur?',
      answer:
        'Nein. Wir sind lokal verankert in Bünde und nutzen digitale Tools für effiziente Zusammenarbeit, ohne anonyme Callcenter-Struktur.',
    },
  ]

  return [
    {
      ...baseWebPage('/standorte', 'Standorte & Einsatzgebiet OWL, Rocketory', description),
      mainEntity: { '@id': LOCAL_BUSINESS_ID },
      about: { '@id': PLACE_BUNDE_ID },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/images/buende/buende-a30.webp`,
      },
      significantLink: [`${SITE_URL}/agentur/buende`, `${SITE_URL}/kontakt`],
    },
    buildBreadcrumb('/standorte', 'Standorte'),
    buildPlaceBuende(),
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/standorte#service-area`,
      name: 'Einsatzgebiet Rocketory',
      description:
        'Städte und Gemeinden im Einsatzgebiet von Rocketory, betreut vom Standort Bünde, ohne Zweitbüros.',
      itemListElement: SERVICE_AREA_CITIES.map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: {
          '@type': 'City',
          name,
        },
      })),
    },
    buildFaqPage('/standorte', faqs),
  ]
}

export function buildAngebotePageSchema(): SchemaNode[] {
  const description =
    'Maßgeschneiderte Webseiten als statisches HTML, WordPress oder CMS mit Next.js & Payload, transparent kalkuliert und langfristig betreut.'

  return [
    baseWebPage('/angebote', 'Angebote, Rocketory', description),
    buildBreadcrumb('/angebote', 'Angebote'),
    {
      '@type': 'OfferCatalog',
      '@id': `${SITE_URL}/angebote#catalog`,
      name: 'Rocketory Angebote',
      itemListElement: CORE_SERVICES.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
          provider: { '@id': LOCAL_BUSINESS_ID },
        },
      })),
    },
  ]
}

export function buildWebdesignPageSchema(): SchemaNode[] {
  const description = META_WEBDESIGN
  const faqs = [
    {
      question: 'Was kostet eine maßgeschneiderte Webseite?',
      answer:
        'Den Preis legen wir nach Umfang fest: Seiten, Funktionen, Texte, Technik. Es gibt kein verstecktes Kleingedrucktes und keine Standardpakete. Orientierung im Erstgespräch: https://rocketory.de/kontakt',
    },
    {
      question: 'Wie lange dauert ein Webdesign-Projekt?',
      answer:
        'Abhängig von Freigaben und Inhalt. Ein klarer Auftritt ohne CMS geht schneller als ein umfangreiches Backend. Den Zeitplan sprechen wir vor dem Kick-off ab.',
    },
    {
      question: 'Ist das ein Baukasten oder individuelles Design?',
      answer:
        'Individuell. Wir verkaufen keine Themes mit ausgetauschtem Logo. Layout, Typo und Bildwelt entstehen für dein Angebot.',
    },
    {
      question: 'Welche Technologie empfehlt ihr?',
      answer:
        'Die, die zu Pflege und Tempo passt: statisches HTML, WordPress oder Next.js & Payload. Entscheidungshilfe: https://rocketory.de/technologien',
    },
    {
      question: 'Arbeitet ihr nur für Unternehmen aus Bünde?',
      answer:
        'Unser Büro ist in Bünde. Betreuung gibt es im gesamten Einsatzgebiet OWL und digital, wenn die Wege weiter sind. Kein zweites Büro. https://rocketory.de/agentur/buende',
    },
    {
      question: 'Was passiert nach dem Launch mit der Webseite?',
      answer:
        'Du kannst die Seite selbst weiterbetreiben oder Rocketory für Wartung, Hosting und Updates beauftragen. SEO: https://rocketory.de/seo · Wartung: https://rocketory.de/wartung',
    },
  ]

  return [
    {
      ...baseWebPage(
        '/webdesign',
        'Webdesign Bünde: maßgeschneiderte Webseite | Rocketory',
        description,
      ),
      mainEntity: { '@id': `${SITE_URL}/webdesign#service` },
      significantLink: [
        `${SITE_URL}/angebote`,
        `${SITE_URL}/agentur/buende`,
        `${SITE_URL}/kontakt`,
        `${SITE_URL}/technologien`,
      ],
    },
    buildBreadcrumbTrail([
      { name: 'Startseite', path: '/' },
      { name: 'Angebote', path: '/angebote' },
      { name: 'Webdesign', path: '/webdesign' },
    ]),
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/webdesign#service`,
      name: 'Webdesign: maßgeschneiderte Webseite',
      serviceType: 'Webdesign',
      description,
      url: `${SITE_URL}/webdesign`,
      provider: { '@id': LOCAL_BUSINESS_ID },
      areaServed: serviceAreaNodes(),
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/kontakt`,
        availability: 'https://schema.org/InStock',
        description: 'Individuell kalkuliert nach Erstgespräch, kein Standardpaket.',
      },
    },
    buildFaqPage('/webdesign', faqs),
  ]
}

export function buildSeoPageSchema(): SchemaNode[] {
  const description = META_SEO
  const faqs = [
    {
      question: 'Ist SEO im Webdesign schon enthalten?',
      answer:
        'Ja, die On-Page-Basis gehört zum Webdesign. Der Reichweite-Service ist die fortlaufende Erweiterung danach: https://rocketory.de/webdesign',
    },
    {
      question: 'Wann lohnt sich 6 Monate, wann 12?',
      answer:
        '6 Monate für Einstieg und Quick Wins. 12 Monate, wenn Content, lokale Präsenz und nachhaltige Rankings im Fokus stehen.',
    },
    {
      question: 'Wie wird der Preis ermittelt?',
      answer:
        'Individuell nach Branche, Wettbewerb und Ausgangslage. Einschätzung im Erstgespräch: https://rocketory.de/kontakt',
    },
    {
      question: 'Brauche ich SEO ohne neue Webseite?',
      answer:
        'Oft ja, wenn die bestehende Seite technisch und inhaltlich tragfähig ist. Fehlen Struktur oder Tempo, lohnt sich zuerst ein Relaunch.',
    },
    {
      question: 'Was messt ihr konkret?',
      answer:
        'Rankings zu abgestimmten Keywords, organischen Traffic und, wo zuordenbar, Anfragen. Monatliches Reporting in verständlicher Sprache.',
    },
    {
      question: 'Passt SEO zu Wartung & Hosting?',
      answer:
        'Ja. Viele Kunden kombinieren beides. Wartung hält Technik stabil, Reichweite baut Sichtbarkeit aus: https://rocketory.de/wartung',
    },
  ]

  return [
    {
      ...baseWebPage('/seo', 'SEO & Reichweite Bünde | Rocketory', description),
      mainEntity: { '@id': `${SITE_URL}/seo#service` },
      significantLink: [`${SITE_URL}/webdesign`, `${SITE_URL}/wartung`, `${SITE_URL}/kontakt`],
    },
    buildBreadcrumbTrail([
      { name: 'Startseite', path: '/' },
      { name: 'Angebote', path: '/angebote' },
      { name: 'SEO & Reichweite', path: '/seo' },
    ]),
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/seo#service`,
      name: 'SEO & Reichweite',
      serviceType: 'Search Engine Optimization',
      description,
      url: `${SITE_URL}/seo`,
      provider: { '@id': LOCAL_BUSINESS_ID },
      areaServed: serviceAreaNodes(),
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/kontakt`,
        availability: 'https://schema.org/InStock',
        description: 'Optional, 6 oder 12 Monate, individuell kalkuliert.',
      },
    },
    buildFaqPage('/seo', faqs),
  ]
}

export function buildWartungPageSchema(): SchemaNode[] {
  const description = META_WARTUNG
  const faqs = [
    {
      question: 'Ist Wartung in jedem Projekt Pflicht?',
      answer:
        'Bei Monats-Paketen typischerweise fest eingeplant. Nach Festpreis-Projekten optional buchbar oder Eigenbetrieb möglich.',
    },
    {
      question: 'Für welche Technologien gilt das?',
      answer:
        'Für statisches HTML, WordPress und Next.js & Payload: https://rocketory.de/technologien',
    },
    {
      question: 'Wie schnell bekomme ich Support?',
      answer:
        'Derselbe Ansprechpartner wie im Projekt. Rückmeldung in der Regel innerhalb von 24 Stunden an Werktagen.',
    },
    {
      question: 'Was passiert bei einem Ausfall?',
      answer:
        'Monitoring und Backups greifen zuerst. Wir stellen wieder her, prüfen die Ursache und dokumentieren den Vorfall.',
    },
    {
      question: 'Kann ich später SEO dazu buchen?',
      answer: 'Ja, über den optionalen Reichweite-Service: https://rocketory.de/seo',
    },
    {
      question: 'Betreut ihr auch fremde Webseiten?',
      answer:
        'Oft ja, nach einem kurzen Technik-Check. Wenn die Basis unsicher oder unwartbar ist, sagen wir das vor Vertragsbeginn klar.',
    },
  ]

  return [
    {
      ...baseWebPage('/wartung', 'Wartung & Sicherheit Bünde | Rocketory', description),
      mainEntity: { '@id': `${SITE_URL}/wartung#service` },
      significantLink: [`${SITE_URL}/webdesign`, `${SITE_URL}/seo`, `${SITE_URL}/kontakt`],
    },
    buildBreadcrumbTrail([
      { name: 'Startseite', path: '/' },
      { name: 'Angebote', path: '/angebote' },
      { name: 'Wartung & Sicherheit', path: '/wartung' },
    ]),
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/wartung#service`,
      name: 'Wartung & Sicherheit',
      serviceType: 'Website Maintenance',
      description,
      url: `${SITE_URL}/wartung`,
      provider: { '@id': LOCAL_BUSINESS_ID },
      areaServed: serviceAreaNodes(),
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/kontakt`,
        availability: 'https://schema.org/InStock',
        description: 'Hosting, Backups, Updates und Support, stackabhängig.',
      },
    },
    buildFaqPage('/wartung', faqs),
  ]
}

export function buildTechnologienPageSchema(): SchemaNode[] {
  const description =
    'Statisches HTML, WordPress oder CMS mit Next.js & Payload, wir empfehlen ehrlich, was zu deinem Business passt.'

  return [
    baseWebPage('/technologien', 'Technologien, Rocketory', description),
    buildBreadcrumb('/technologien', 'Technologien'),
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/technologien#stack`,
      name: 'Technologie-Optionen',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Statisches HTML' },
        { '@type': 'ListItem', position: 2, name: 'WordPress' },
        { '@type': 'ListItem', position: 3, name: 'Next.js & Payload CMS' },
      ],
    },
  ]
}

export function buildBlogListingSchema(
  posts: Array<{ title: string; slug: string; excerpt?: string | null }>,
): SchemaNode[] {
  const description =
    'Praxiswissen zu Webdesign, SEO und digitalem Auftritt, aus echten Projekten, ehrlich erzählt.'

  return [
    {
      ...baseWebPage('/blog', 'Blog, Rocketory', description, 'CollectionPage'),
      '@type': ['CollectionPage', 'Blog'],
      blogPost: posts.slice(0, 12).map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: `${SITE_URL}/blog/${post.slug}`,
        description: post.excerpt || undefined,
      })),
    },
    buildBreadcrumb('/blog', 'Blog'),
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/blog#list`,
      itemListElement: posts.slice(0, 12).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  ]
}

export function buildProjekteListingSchema(
  projects: Array<{ title: string; slug: string; excerpt?: string | null }>,
): SchemaNode[] {
  const description =
    'Konkrete Referenzen mit Zielen, Umsetzung und Ergebnissen, ehrlich erzählt, ohne Agentur-Blabla.'

  return [
    {
      ...baseWebPage('/projekte', 'Projekte, Rocketory', description, 'CollectionPage'),
      hasPart: projects.slice(0, 12).map((project) => ({
        '@type': 'CreativeWork',
        name: project.title,
        url: `${SITE_URL}/projekte/${project.slug}`,
        description: project.excerpt || undefined,
      })),
    },
    buildBreadcrumb('/projekte', 'Projekte'),
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/projekte#list`,
      itemListElement: projects.slice(0, 12).map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/projekte/${project.slug}`,
        name: project.title,
      })),
    },
  ]
}

export function buildKontaktPageSchema(): SchemaNode[] {
  const description =
    'Projekt anfragen bei Rocketory in Bünde, Webdesign, SEO und Betreuung aus einer Hand. Unverbindlich in wenigen Schritten.'

  return [
    {
      ...baseWebPage('/kontakt', 'Kontakt, Rocketory', description, 'ContactPage'),
      mainEntity: { '@id': LOCAL_BUSINESS_ID },
    },
    buildBreadcrumb('/kontakt', 'Kontakt'),
    {
      '@type': 'ContactPoint',
      '@id': `${SITE_URL}/kontakt#contact`,
      contactType: 'customer service',
      email: ORG_EMAIL,
      telephone: ORG_PHONE,
      areaServed: 'DE',
      availableLanguage: ['de'],
    },
  ]
}

export function buildKiCheckPageSchema(): SchemaNode[] {
  const description =
    'KI-Check zur EU-KI-Verordnung: Kennzeichnung und Compliance für deine Webseite einschätzen – von Rocketory aus Bünde.'

  return [
    {
      ...baseWebPage(
        '/ki-check',
        'KI-Check: Ist deine Webseite rechtssicher? | Rocketory',
        description,
      ),
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/images/ki-check-hero-law.jpg`,
        width: 1024,
        height: 630,
      },
      about: [
        { '@type': 'Thing', name: 'EU-KI-Verordnung' },
        { '@type': 'Thing', name: 'KI-Kennzeichnung' },
        { '@type': 'Thing', name: 'KI-Compliance' },
      ],
    },
    buildBreadcrumb('/ki-check', 'KI-Check'),
  ]
}

export function buildImpressumPageSchema(): SchemaNode[] {
  return [
    baseWebPage(
      '/impressum',
      'Impressum, Rocketory',
      'Impressum von Rocketory / FairFlock GmbH, Anbieterkennzeichnung gemäß DDG.',
    ),
    buildBreadcrumb('/impressum', 'Impressum'),
  ]
}

export function buildDatenschutzPageSchema(): SchemaNode[] {
  return [
    baseWebPage(
      '/datenschutz',
      'Datenschutzerklärung, Rocketory',
      'Datenschutzerklärung von Rocketory, Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
    ),
    buildBreadcrumb('/datenschutz', 'Datenschutz'),
  ]
}

function buildContentBreadcrumb(
  sectionPath: '/blog' | '/projekte',
  sectionName: string,
  title: string,
  slug: string,
): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}${sectionPath}/${slug}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: sectionName, item: `${SITE_URL}${sectionPath}` },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${SITE_URL}${sectionPath}/${slug}`,
      },
    ],
  }
}

export function buildBlogPostPageSchema(post: Post): SchemaNode[] {
  const article = buildPostSchemaJsonLd(post.schema)[0]
  if (!article) return [buildContentBreadcrumb('/blog', 'Blog', post.title, post.slug)]

  return [
    {
      ...article,
      '@id': `${SITE_URL}/blog/${post.slug}#article`,
      url: `${SITE_URL}/blog/${post.slug}`,
      image: getPostHeroImage(post),
      isPartOf: { '@id': `${SITE_URL}/blog#webpage` },
      publisher: { '@id': ORGANIZATION_ID },
      mainEntityOfPage: { '@id': `${SITE_URL}/blog/${post.slug}#webpage` },
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}#webpage`,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: `${post.title}, Rocketory`,
      isPartOf: { '@id': WEBSITE_ID },
    },
    buildContentBreadcrumb('/blog', 'Blog', post.title, post.slug),
  ]
}

export function buildProjectPageSchema(project: Project): SchemaNode[] {
  const article = buildPostSchemaJsonLd(project.schema)[0]

  const creativeWork: SchemaNode = article
    ? {
        ...article,
        '@type': 'CreativeWork',
        '@id': `${SITE_URL}/projekte/${project.slug}#project`,
        url: `${SITE_URL}/projekte/${project.slug}`,
        image: getProjectHeroImage(project),
        creator: { '@id': ORGANIZATION_ID },
        isPartOf: { '@id': `${SITE_URL}/projekte#webpage` },
      }
    : {
        '@type': 'CreativeWork',
        '@id': `${SITE_URL}/projekte/${project.slug}#project`,
        name: project.title,
        url: `${SITE_URL}/projekte/${project.slug}`,
        description: project.excerpt || undefined,
        image: getProjectHeroImage(project),
        creator: { '@id': ORGANIZATION_ID },
      }

  return [
    creativeWork,
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/projekte/${project.slug}#webpage`,
      url: `${SITE_URL}/projekte/${project.slug}`,
      name: `${project.title}, Rocketory`,
      isPartOf: { '@id': WEBSITE_ID },
    },
    buildContentBreadcrumb('/projekte', 'Projekte', project.title, project.slug),
  ]
}

export function buildLegacyBlogPostSchema(
  slug: string,
  title: string,
  description?: string,
  image?: string,
  dates?: { published?: string; modified?: string },
): SchemaNode[] {
  return [
    {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/${slug}#article`,
      headline: title,
      description,
      image,
      datePublished: dates?.published,
      dateModified: dates?.modified || dates?.published,
      url: `${SITE_URL}/blog/${slug}`,
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      isPartOf: { '@id': `${SITE_URL}/blog#webpage` },
      mainEntityOfPage: { '@id': `${SITE_URL}/blog/${slug}#webpage` },
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}#webpage`,
      url: `${SITE_URL}/blog/${slug}`,
      name: title,
      isPartOf: { '@id': WEBSITE_ID },
    },
    buildContentBreadcrumb('/blog', 'Blog', title.replace(/ – Rocketory$/, ''), slug),
  ]
}
