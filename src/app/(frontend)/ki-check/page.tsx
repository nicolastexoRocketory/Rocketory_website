import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { injectFeaturedPostSection, type FeaturedPostSection } from '@/lib/homepage'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildPageMetadata } from '@/lib/metadata'
import { getPublishedPosts } from '@/lib/posts'
import { buildKiCheckPageSchema } from '@/lib/schema-org'

import '@/styles/agentur.css'
import '@/styles/contact.css'
import '@/styles/ki-check.css'

export const revalidate = 3600

const KI_VO_SLUG = 'eu-ai-act-ki-verordnung-webdesign'

const TITLE = 'KI-Check: Ist deine Webseite rechtssicher? | Rocketory'
const DESCRIPTION =
  'KI-Check zur EU-KI-Verordnung: Kennzeichnung und Compliance für deine Webseite einschätzen – von Rocketory aus Bünde.'
const SOCIAL_TITLE = 'Ist deine Webseite noch rechtssicher?'
const SOCIAL_DESCRIPTION =
  'Geschätzt 60 % aller Webseiten sind es nicht. KI-Check von Rocketory: Kennzeichnung, KI-VO und Compliance für deine Webseite.'
const OG_IMAGE = '/assets/images/ki-check-hero-law.jpg'

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  socialTitle: SOCIAL_TITLE,
  socialDescription: SOCIAL_DESCRIPTION,
  path: '/ki-check',
  image: OG_IMAGE,
  imageAlt: 'Justitia-Waage – Symbol für Rechtssicherheit und die EU-KI-Verordnung',
  imageWidth: 1024,
  imageHeight: 630,
})

async function getKiVoFeaturedSection(): Promise<FeaturedPostSection | null> {
  const posts = await getPublishedPosts()
  const post = posts.find((entry) => entry.slug === KI_VO_SLUG)
  if (!post) return null

  return {
    title: 'Beitrag im Fokus.',
    titleEm: 'Was gerade wichtig ist.',
    intro:
      'Praxiswissen zur EU-KI-Verordnung: Kennzeichnung, Kompetenzpflicht und was das für deine Webseite bedeutet.',
    post,
  }
}

export default async function KiCheckPage() {
  const page = getLegacyPage('ki-check.html')
  const featuredSection = await getKiVoFeaturedSection()
  const content = injectFeaturedPostSection(page.content, featuredSection)

  return (
    <>
      <link
        rel="preload"
        href="/assets/images/ki-check-hero-law.webp"
        as="image"
        type="image/webp"
        fetchPriority="high"
      />
      <PageSchema nodes={buildKiCheckPageSchema()} />
      <LegacyPage {...page} content={content} />
    </>
  )
}
