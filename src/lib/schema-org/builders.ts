import type { Post, Project } from '@/payload-types'

import { SITE_URL } from '@/lib/metadata'
import { getPostHeroImage } from '@/lib/posts'
import { getProjectHeroImage } from '@/lib/projects'
import { MAIN_SITE_NAV } from '@/lib/site-schema'

import { buildPostSchemaJsonLd } from '../build-post-schema-jsonld'
import {
  CORE_SERVICES,
  GEO_BUNDE,
  LOCAL_BUSINESS_ID,
  ORG_ADDRESS,
  ORG_BRAND,
  ORG_EMAIL,
  ORG_LEGAL_NAME,
  ORG_SAME_AS,
  ORGANIZATION_ID,
  PLACE_BUNDE_ID,
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

function buildBreadcrumb(path: string, currentName: string): SchemaNode {
  const crumbs = [{ name: 'Startseite', path: '/' }]
  if (path !== '/') {
    crumbs.push({ name: currentName, path })
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL}${path === '/' ? '' : path}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path === '/' ? '' : crumb.path}`,
    })),
  }
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
      image: `${SITE_URL}/assets/images/team-rocketory.png`,
      email: ORG_EMAIL,
      address: ORG_ADDRESS,
      sameAs: ORG_SAME_AS,
    },
    {
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': LOCAL_BUSINESS_ID,
      name: ORG_BRAND,
      legalName: ORG_LEGAL_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/assets/images/team-rocketory.png`,
      email: ORG_EMAIL,
      address: ORG_ADDRESS,
      geo: GEO_BUNDE,
      parentOrganization: { '@id': ORGANIZATION_ID },
      areaServed: [
        { '@type': 'City', name: 'Bünde' },
        { '@type': 'AdministrativeArea', name: 'Ostwestfalen-Lippe' },
        { '@type': 'State', name: 'Nordrhein-Westfalen' },
      ],
      priceRange: '€€',
      knowsAbout: ['Webdesign', 'SEO', 'WordPress', 'Next.js', 'Payload CMS'],
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
          areaServed: { '@type': 'City', name: 'Bünde' },
        },
      })),
    },
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
        url: `${SITE_URL}/assets/images/team-raketenstart.png`,
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
    {
      '@type': 'Place',
      '@id': PLACE_BUNDE_ID,
      name: 'Bünde',
      description:
        'Bünde in Ostwestfalen-Lippe – Standort von Rocketory und Schwerpunkt für regionales Webdesign und SEO.',
      geo: GEO_BUNDE,
      address: ORG_ADDRESS,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Ostwestfalen-Lippe',
      },
    },
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
      areaServed: 'DE',
      availableLanguage: ['de'],
    },
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
