import { LegacyPage } from '@/components/LegacyPage'
import { getLegacyPage } from '@/lib/legacy-page'
import { buildPageMetadata } from '@/lib/metadata'

import '@/styles/team.css'

export const revalidate = 3600

export const metadata = buildPageMetadata({
  title: 'Team | Rocketory',
  description:
    'Das Team hinter Rocketory in Bünde: die Menschen, die Webseiten für KMU in OWL planen, gestalten und umsetzen.',
  path: '/team',
  image: '/assets/images/team/team-member-1.jpg',
})

export default function TeamPage() {
  const page = getLegacyPage('team.html')
  return <LegacyPage {...page} />
}
