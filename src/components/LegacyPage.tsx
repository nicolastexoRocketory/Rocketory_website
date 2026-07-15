import type { LegacyPageData } from '@/lib/legacy-page'
import { injectBlogSidebar } from '@/lib/blog-content'
import { getStaticComponentHtml } from '@/lib/static-html'

import { LegacyContentEvents } from './LegacyContentEvents'
import { RocketoryScripts } from './RocketoryScripts'
import { ServerLegacyContent } from './ServerLegacyContent'

type LegacyPageProps = Pick<LegacyPageData, 'content' | 'scripts' | 'pageClass'> & {
  withBlogSidebar?: boolean
}

export function LegacyPage({ content, scripts, pageClass, withBlogSidebar }: LegacyPageProps) {
  const rootClass = pageClass ? `rk ${pageClass}` : 'rk'
  const pageContent = withBlogSidebar ? injectBlogSidebar(content) : content
  const html =
    getStaticComponentHtml('nav.html') +
    `<main id="main-content">${pageContent}</main>` +
    getStaticComponentHtml('footer.html')

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

