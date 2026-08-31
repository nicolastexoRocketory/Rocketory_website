import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getFeaturedPostSection, injectFeaturedPostSection } from '@/lib/homepage'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildPageMetadata } from '@/lib/metadata'
import { getPublishedPosts, injectPostsIntoHomepage } from '@/lib/posts'
import { buildHomePageSchema } from '@/lib/schema-org'

export const revalidate = 3600

export const metadata = buildPageMetadata({
  title: 'Rocketory: All in One Webdesign und SEO aus Bünde',
  description:
    'Design, Technik, Texte, Hosting, Webdesign, SEO und Betreuung aus Bünde. Persönlich gebaut, fair kalkuliert, langfristig betreut.',
  path: '/',
  image: '/assets/images/team-raketenstart.webp',
})

export default async function LandingPage() {
  const page = getLegacyPage('index.html')
  const [posts, featuredSection] = await Promise.all([getPublishedPosts(), getFeaturedPostSection()])
  const content = injectFeaturedPostSection(injectPostsIntoHomepage(page.content, posts), featuredSection)

  return (
    <>
      <link
        rel="preload"
        href="/assets/images/team-raketenstart.webp"
        as="image"
        fetchPriority="high"
      />
      <PageSchema nodes={buildHomePageSchema()} />
      <LegacyPage {...page} content={content} />
    </>
  )
}
