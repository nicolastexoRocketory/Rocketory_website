import type { Post, Project } from '@/payload-types'

import { SITE_URL } from '@/lib/metadata'
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
      alternateName: 'Rocketory – Webdesign Bünde',
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
  const description =
    'Design, Technik, Texte, Hosting – Webdesign, SEO und Betreuung aus Bünde. Persönlich gebaut, fair kalkuliert, langfristig betreut.'

  return [
    {
      ...baseWebPage('/', 'Rocketory – All in One Webdesign und SEO aus Bünde', description),
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
    'Webdesign-Team aus Bünde mit festem Standort in Ostwestfalen-Lippe – persönlich, ehrlich, ohne Verkaufsdruck.'

  return [
    {
      ...baseWebPage('/agentur', 'Agentur – Rocketory', description, 'AboutPage'),
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
      question: 'Wo hat Rocketory sein Büro?',
      answer:
        'Rocketory ist die Agenturmarke der FairFlock GmbH. Das Büro liegt in der Zimmerstraße 16, 32257 Bünde (Remise) – das ist unser einziger physischer Kundenstandort. Der rechtliche Firmensitz der FairFlock GmbH ist Sonnenhügel 16a, 32257 Bünde.',
    },
    {
      question: 'Warum sitzt eine Webdesign-Agentur ausgerechnet in Bünde?',
      answer:
        'Weil hier Mittelstand, Handwerk und lokale Dienstleister zu Hause sind – und weil wir als FairFlock-Unit regional verankert arbeiten. Bünde ist Zigarrenstadt, Wirtschaftsstandort und Alltag für Betriebe, die digital Anfragen brauchen.',
    },
    {
      question: 'Gibt es ein Rocketory-Büro in Herford oder Bielefeld?',
      answer:
        'Nein. Wir haben kein Zweitbüro. Termine und Betreuung für Kunden aus Herford, Bielefeld und dem restlichen OWL laufen von Bünde aus – online oder nach Absprache vor Ort bei dir.',
    },
    {
      question: 'Arbeitet Rocketory nur für Unternehmen aus Bünde?',
      answer:
        'Nein. Bünde ist Standort und Schwerpunkt. Projekte begleiten wir in der gesamten OWL-Region und darüber hinaus – wenn der Fit stimmt. Überblick: https://rocketory.de/standorte',
    },
    {
      question: 'Kann ich euch vor Ort in Bünde treffen?',
      answer:
        'Ja, nach Absprache. Viele Erstgespräche starten online; vor Ort in Bünde oder bei dir ist möglich, wenn es zum Projekt passt. Kontakt: https://rocketory.de/kontakt',
    },
    {
      question: 'Was macht Rocketory in Bünde konkret?',
      answer:
        'Webdesign, SEO und langfristige Website-Betreuung für KMU, Handwerk und lokale Dienstleister – persönlich betreut und fair kalkuliert. Details: https://rocketory.de/angebote',
    },
    {
      question: 'Seid ihr eine Remote-Agentur?',
      answer:
        'Nein. Wir sind lokal verankert in Bünde und nutzen digitale Tools für effiziente Zusammenarbeit – ohne anonyme Callcenter-Struktur.',
    },
  ]

  return [
    {
      ...baseWebPage(
        '/agentur/buende',
        'Webdesign-Agentur in Bünde (OWL) – Rocketory',
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
        'Einen: das Büro in Bünde (Zimmerstraße 16). Die Orte auf der Standorte-Seite beschreiben das Einsatzgebiet – keine weiteren Büros. Details: https://rocketory.de/agentur/buende',
    },
    {
      question: 'Betreut ihr auch Kunden außerhalb von Bünde?',
      answer:
        'Ja. Schwerpunkt ist OWL (unter anderem Herford, Enger, Löhne, Bad Oeynhausen, Bielefeld). Zusammenarbeit funktioniert online und – wenn sinnvoll – vor Ort.',
    },
    {
      question: 'Warum steht „Standorte“ auf der Website?',
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
        'Nein. Wir sind lokal verankert in Bünde und nutzen digitale Tools für effiziente Zusammenarbeit – ohne anonyme Callcenter-Struktur.',
    },
  ]

  return [
    {
      ...baseWebPage('/standorte', 'Standorte & Einsatzgebiet OWL – Rocketory', description),
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
        'Städte und Gemeinden im Einsatzgebiet von Rocketory – betreut vom Standort Bünde, ohne Zweitbüros.',
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
    'Maßgeschneiderte Websites als statisches HTML, WordPress oder CMS mit Next.js & Payload – transparent kalkuliert und langfristig betreut.'

  return [
    baseWebPage('/angebote', 'Angebote – Rocketory', description),
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

export function buildTechnologienPageSchema(): SchemaNode[] {
  const description =
    'Statisches HTML, WordPress oder CMS mit Next.js & Payload – wir empfehlen ehrlich, was zu deinem Business passt.'

  return [
    baseWebPage('/technologien', 'Technologien – Rocketory', description),
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
    'Praxiswissen zu Webdesign, SEO und digitalem Auftritt – aus echten Projekten, ehrlich erzählt.'

  return [
    {
      ...baseWebPage('/blog', 'Blog – Rocketory', description, 'CollectionPage'),
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
    'Konkrete Referenzen mit Zielen, Umsetzung und Ergebnissen – ehrlich erzählt, ohne Agentur-Blabla.'

  return [
    {
      ...baseWebPage('/projekte', 'Projekte – Rocketory', description, 'CollectionPage'),
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
    'Projekt anfragen bei Rocketory in Bünde – Webdesign, SEO und Betreuung aus einer Hand. Unverbindlich in wenigen Schritten.'

  return [
    {
      ...baseWebPage('/kontakt', 'Kontakt – Rocketory', description, 'ContactPage'),
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

export function buildImpressumPageSchema(): SchemaNode[] {
  return [
    baseWebPage(
      '/impressum',
      'Impressum – Rocketory',
      'Impressum von Rocketory / FairFlock GmbH – Anbieterkennzeichnung gemäß DDG.',
    ),
    buildBreadcrumb('/impressum', 'Impressum'),
  ]
}

export function buildDatenschutzPageSchema(): SchemaNode[] {
  return [
    baseWebPage(
      '/datenschutz',
      'Datenschutzerklärung – Rocketory',
      'Datenschutzerklärung von Rocketory – Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
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
      name: `${post.title} – Rocketory`,
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
      name: `${project.title} – Rocketory`,
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
