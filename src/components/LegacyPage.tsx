import type { LegacyPageData } from '@/lib/legacy-page'
import { injectBlogSidebar } from '@/lib/blog-content'
import { applySiteMedia } from '@/lib/site-media'
import { getStaticComponentHtml } from '@/lib/static-html'

import { LegacyContentEvents } from './LegacyContentEvents'
import { RocketoryScripts } from './RocketoryScripts'
import { ServerLegacyContent } from './ServerLegacyContent'

type LegacyPageProps = Pick<LegacyPageData, 'content' | 'scripts' | 'pageClass'> & {
  withBlogSidebar?: boolean
}

export async function LegacyPage({ content, scripts, pageClass, withBlogSidebar }: LegacyPageProps) {
  const rootClass = pageClass ? `rk ${pageClass}` : 'rk'
  const pageContent = withBlogSidebar ? injectBlogSidebar(content) : content
  const [navHtml, mainHtml, footerHtml] = await Promise.all([
    applySiteMedia(getStaticComponentHtml('nav.html')),
    applySiteMedia(pageContent),
    applySiteMedia(getStaticComponentHtml('footer.html')),
  ])
  const html =
    navHtml + `<main id="main-content">${mainHtml}</main>` + footerHtml

  return (
    <>
      <LegacyContentEvents />
      <div className="rk-shell" suppressHydrationWarning>
        <a href="#main-content" className="rk-skip-link">
          Zum Inhalt springen
        </a>
        <div className={rootClass} suppressHydrationWarning>
          <ServerLegacyContent html={html} />
        </div>
      </div>
      <RocketoryScripts scripts={scripts} withBlogSidebar={withBlogSidebar} />
    </>
  )
}

