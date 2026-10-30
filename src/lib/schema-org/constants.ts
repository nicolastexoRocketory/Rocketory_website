import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/metadata'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`
export const PLACE_BUNDE_ID = `${SITE_URL}/agentur/buende#place`

/** Städte/Gemeinden im Einsatzgebiet (kein Zweitbüro). */
export const SERVICE_AREA_CITIES = [
  'Bünde',
  'Enger',
  'Hiddenhausen',
  'Kirchlengern',
  'Rödinghausen',
  'Löhne',
  'Herford',
  'Bad Oeynhausen',
  'Minden',
  'Lübbecke',
  'Bielefeld',
  'Porta Westfalica',
  'Vlotho',
] as const

export const ORG_EMAIL = 'beratung@rocketory.de'
export const ORG_PHONE = '+491607624145'
export const ORG_PHONE_DISPLAY = '0160 7624 145'
export const ORG_LEGAL_NAME = 'FairFlock GmbH'
export const ORG_BRAND = SITE_NAME

/** Öffentliche Besucher-/Büroadresse Rocketory (Remise). */
export const ORG_ADDRESS = {
  '@type': 'PostalAddress' as const,
  streetAddress: 'Zimmerstr. 16',
  addressLocality: 'Bünde',
  addressRegion: 'Nordrhein-Westfalen',
  postalCode: '32257',
  addressCountry: 'DE',
}

/** Rechtlicher Firmensitz FairFlock GmbH (Impressum). */
export const LEGAL_ADDRESS = {
  '@type': 'PostalAddress' as const,
  streetAddress: 'Sonnenhügel 16a',
  addressLocality: 'Bünde',
  addressRegion: 'Nordrhein-Westfalen',
  postalCode: '32257',
  addressCountry: 'DE',
}

/** Geo Zimmerstr. 16, Bünde (Büro Remise / Nominatim). */
export const GEO_BUNDE = {
  '@type': 'GeoCoordinates' as const,
  latitude: 52.2063142,
  longitude: 8.5911147,
}

/** Google Maps: Firmenpin Rocketory (Büroadresse). */
export const MAPS_EMBED_URL =
  'https://www.google.com/maps?q=Rocketory,+Zimmerstra%C3%9Fe+16,+32257+B%C3%BCnde&hl=de&z=17&output=embed'

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Rocketory,+Zimmerstra%C3%9Fe+16,+32257+B%C3%BCnde'

export const LOCATION_OG_IMAGE = '/assets/images/buende/buende-a30.webp'

export const META_AGENTUR_BUENDE =
  'Webdesign-Agentur in Bünde (OWL): Büro Zimmerstr. 16, Kreis Herford. Rocketory, persönliche Betreuung für KMU & Handwerk, lokal statt Remote.'

export const META_STANDORTE =
  'Ein Standort in Bünde, Einsatzgebiet OWL: Herford, Enger, Löhne, Bad Oeynhausen, Bielefeld. Keine Fake-Büros.'

export const META_WEBDESIGN =
  'Webseiten mit Raketenantrieb: maßgeschneidertes Webdesign aus Bünde für KMU in OWL. Design, Texte, Technik aus einer Hand, kein Baukasten. Erstgespräch in 24 h.'

export const META_SEO =
  'SEO & Reichweite aus Bünde: optionale 6- oder 12-Monats-Pakete für lokale Sichtbarkeit und messbare Anfragen. Ehrlich eingeschätzt, individuell kalkuliert.'

export const META_WARTUNG =
  'Wartung & Sicherheit für deine Webseite: Hosting, Backups, Updates und persönlicher Support aus Bünde, passend zu HTML, WordPress oder Next.js & Payload.'

export const ORG_SAME_AS = [
  'https://www.instagram.com/rocketory',
  'https://www.youtube.com/@rocketory',
  'https://www.linkedin.com/company/rocketory',
]

export const SITE_DESCRIPTION = DEFAULT_DESCRIPTION

export const CORE_SERVICES = [
  {
    name: 'Webdesign',
    description: 'Maßgeschneiderte Webseiten, Design, Technik und Texte aus einer Hand.',
  },
  {
    name: 'SEO & Reichweite',
    description: 'Suchmaschinenoptimierung und lokale Sichtbarkeit für nachhaltige Anfragen.',
  },
  {
    name: 'Webseiten-Betreuung',
    description: 'Hosting, Updates und langfristige Betreuung nach dem Launch.',
  },
] as const
