import { getStaticComponentHtml } from '@/lib/static-html'

import { ServerLegacyContent } from './ServerLegacyContent'

export function Footer() {
  const html = getStaticComponentHtml('footer.html')
  return <ServerLegacyContent html={html} />
}
