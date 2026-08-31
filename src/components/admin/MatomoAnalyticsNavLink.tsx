'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import './matomo-analytics.css'

export function MatomoAnalyticsNavLink() {
  const pathname = usePathname()
  const href = '/admin/statistik'
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link className="rk-matomo-nav-link" href={href} aria-current={active ? 'page' : undefined}>
      Statistik
    </Link>
  )
}

export default MatomoAnalyticsNavLink
