import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildLegacyPageMetadata } from '@/lib/metadata'
import { getBlogCategories, getPublishedPosts, injectPostsIntoBlog } from '@/lib/posts'
import { buildBlogListingSchema } from '@/lib/schema-org'

export const revalidate = 3600

export const metadata = buildLegacyPageMetadata('blog.html', '/blog')

export default async function BlogPage() {
  const page = getLegacyPage('blog.html')
  const [posts, categories] = await Promise.all([getPublishedPosts(), getBlogCategories()])

  return (
    <>
      <PageSchema nodes={buildBlogListingSchema(posts)} />
      <LegacyPage {...page} content={injectPostsIntoBlog(page.content, posts, categories)} />
    </>
  )
}
