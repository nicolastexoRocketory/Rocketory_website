import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from './metadata'

export type MainNavItem = {
  name: string
  path: string
  description: string
}

/** Hauptnavigation – entspricht der Sitelink-Struktur für Markensuchen. */
export const MAIN_SITE_NAV: MainNavItem[] = [
  {
    name: 'Angebote',
    path: '/angebote',
    description:
      'Maßgeschneiderte Websites als statisches HTML, WordPress oder CMS mit Next.js & Payload – transparent kalkuliert und langfristig betreut.',
  },
  {
    name: 'Technologien',
    path: '/technologien',
    description:
      'Statisches HTML, WordPress oder CMS mit Next.js & Payload – wir empfehlen ehrlich, was zu deinem Business passt.',
  },
  {
    name: 'Agentur',
    path: '/agentur',
    description:
      'Webdesign-Team aus Bünde mit festem Standort in Ostwestfalen-Lippe – persönlich, ehrlich, ohne Verkaufsdruck.',
  },
  {
    name: 'Blog',
    path: '/blog',
    description:
      'Praxiswissen zu Webdesign, SEO und digitalem Auftritt – aus echten Projekten, ehrlich erzählt.',
  },
  {
    name: 'Projekte',
    path: '/projekte',
    description:
      'Konkrete Referenzen mit Zielen, Umsetzung und Ergebnissen – ehrlich erzählt, ohne Agentur-Blabla.',
  },
]

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

export function buildSiteSchemaGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/assets/images/logo_1.png`,
        },
        sameAs: [
          'https://www.instagram.com/rocketory',
          'https://www.youtube.com/@rocketory',
          'https://www.linkedin.com/company/rocketory',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'de-DE',
        publisher: { '@id': ORGANIZATION_ID },
        hasPart: MAIN_SITE_NAV.map((item) => ({
          '@type': 'WebPage',
          '@id': `${SITE_URL}${item.path}`,
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
    ],
  }
}

export function buildSiteSchemaScript(): string {
  return JSON.stringify(buildSiteSchemaGraph()).replace(/</g, '\\u003c')
}
