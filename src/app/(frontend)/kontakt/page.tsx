import { LegacyPage } from '@/components/LegacyPage'
import { PageSchema } from '@/components/PageSchema'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildPageMetadata } from '@/lib/metadata'
import { buildKontaktPageSchema } from '@/lib/schema-org'

import '@/styles/contact.css'

export const metadata = buildPageMetadata({
  title: 'Kontakt, Rocketory',
  description:
    'Projekt anfragen bei Rocketory in Bünde, Webdesign, SEO und Betreuung aus einer Hand. Unverbindlich in wenigen Schritten.',
  path: '/kontakt',
})

export default function KontaktPage() {
  const page = getLegacyPage('kontakt.html')
  return (
    <>
      <PageSchema nodes={buildKontaktPageSchema()} />
      <LegacyPage {...page} />
    </>
  )
}
