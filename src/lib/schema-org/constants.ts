import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/metadata'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`
export const PLACE_BUNDE_ID = `${SITE_URL}/agentur#place-buende`

export const ORG_EMAIL = 'beratung@rocketory.de'
export const ORG_PHONE = '+491607624145'
export const ORG_LEGAL_NAME = 'FairFlock GmbH'
export const ORG_BRAND = SITE_NAME

export const ORG_ADDRESS = {
  '@type': 'PostalAddress' as const,
  streetAddress: 'Zimmerstr. 16',
  addressLocality: 'Bünde',
  addressRegion: 'Nordrhein-Westfalen',
  postalCode: '32257',
  addressCountry: 'DE',
}

export const GEO_BUNDE = {
  '@type': 'GeoCoordinates' as const,
  latitude: 52.1984,
  longitude: 8.5864,
}

export const ORG_SAME_AS = [
  'https://www.instagram.com/rocketory',
  'https://www.youtube.com/@rocketory',
  'https://www.linkedin.com/company/rocketory',
]

export const SITE_DESCRIPTION = DEFAULT_DESCRIPTION

export const CORE_SERVICES = [
  {
    name: 'Webdesign',
    description: 'Maßgeschneiderte Websites – Design, Technik und Texte aus einer Hand.',
  },
  {
    name: 'SEO & Reichweite',
    description: 'Suchmaschinenoptimierung und lokale Sichtbarkeit für nachhaltige Anfragen.',
  },
  {
    name: 'Website-Betreuung',
    description: 'Hosting, Updates und langfristige Betreuung nach dem Launch.',
  },
] as const
