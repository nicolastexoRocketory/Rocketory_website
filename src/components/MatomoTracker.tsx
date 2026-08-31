'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { CONSENT_CHANGED_EVENT, readStoredConsent } from '@/lib/consent'

declare global {
  interface Window {
    _paq?: Array<Array<string | number | boolean>>
  }
}

type MatomoTrackerProps = {
  url: string
  siteId: string
}

function pageKey(): string {
  return `${window.location.pathname}${window.location.search}`
}

function grantMatomoConsent(): void {
  if (typeof window === 'undefined' || !window._paq) return
  window._paq.push(['setCookieConsentGiven'])
}

function revokeMatomoConsent(): void {
  if (typeof window === 'undefined' || !window._paq) return
  window._paq.push(['forgetCookieConsentGiven'])
}

function trackSpaPageView(): void {
  if (typeof window === 'undefined' || !window._paq) return
  window._paq.push(['setCustomUrl', window.location.href])
  window._paq.push(['setDocumentTitle', document.title])
  window._paq.push(['trackPageView'])
}

export function MatomoTracker({ url: _url, siteId: _siteId }: MatomoTrackerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedKey = useRef<string | null>(null)

  useEffect(() => {
    function syncFromStore() {
      const state = readStoredConsent()
      const enabled = Boolean(state?.categories.statistics)
      document.documentElement.dataset.rkMatomoConsent = enabled ? '1' : '0'

      if (enabled) {
        grantMatomoConsent()
        document.documentElement.dataset.rkMatomoActive = '1'
      } else {
        revokeMatomoConsent()
        document.documentElement.dataset.rkMatomoActive = '0'
        lastTrackedKey.current = null
      }
    }

    syncFromStore()
    window.addEventListener(CONSENT_CHANGED_EVENT, syncFromStore)
    document.addEventListener('rk:ready', syncFromStore)

    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, syncFromStore)
      document.removeEventListener('rk:ready', syncFromStore)
    }
  }, [])

  useEffect(() => {
    if (document.documentElement.dataset.rkMatomoConsent !== '1') return
    if (!window._paq) return

    const key = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
    if (lastTrackedKey.current === key) return
    lastTrackedKey.current = key
    trackSpaPageView()
  }, [pathname, searchParams])

  return null
}
