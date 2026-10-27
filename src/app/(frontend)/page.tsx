import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getFeaturedPostSection, injectFeaturedPostSection } from '@/lib/homepage'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildPageMetadata, HOME_PAGE_DESCRIPTION, HOME_PAGE_TITLE } from '@/lib/metadata'
import { getPublishedPosts, injectPostsIntoHomepage } from '@/lib/posts'
import { getPublishedProjects, injectProjectsIntoAgentur } from '@/lib/projects'
import { buildHomePageSchema } from '@/lib/schema-org'

export const revalidate = 3600

export const metadata = buildPageMetadata({
  title: HOME_PAGE_TITLE,
  description: HOME_PAGE_DESCRIPTION,
  path: '/',
  image: '/assets/images/team-raketenstart.webp',
})

export default async function LandingPage() {
  const page = getLegacyPage('index.html')
  const [posts, featuredSection, projects] = await Promise.all([
    getPublishedPosts(),
    getFeaturedPostSection(),
    getPublishedProjects(),
  ])
  const withPosts = injectFeaturedPostSection(injectPostsIntoHomepage(page.content, posts), featuredSection)
  const content = injectProjectsIntoAgentur(withPosts, projects)

  return (
    <>
      <link
        rel="preload"
        href="/assets/images/nasa-shuttle-launch-mobile.webp"
        as="image"
        type="image/webp"
        media="(max-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/assets/images/team-raketenstart.webp"
        as="image"
        type="image/webp"
        media="(min-width: 769px)"
        fetchPriority="high"
      />
      <PageSchema nodes={buildHomePageSchema()} />
      <LegacyPage {...page} content={content} />
    </>
  )
}
