import { getStaticComponentHtml } from '@/lib/static-html'

import { ServerLegacyContent } from './ServerLegacyContent'

export function Nav() {
  const html = getStaticComponentHtml('nav.html')
  return <ServerLegacyContent html={html} />
}
