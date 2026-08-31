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

function loadMatomo(url: string, siteId: string): void {
  if (typeof window === 'undefined') return
  if (document.querySelector('script[data-rk-matomo]')) return

  const base = url.replace(/\/+$/, '')
  const _paq = (window._paq = window._paq || [])

  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['setTrackerUrl', `${base}/matomo.php`])
  _paq.push(['setSiteId', siteId])
  _paq.push(['setSecureCookie', window.location.protocol === 'https:'])
  _paq.push(['trackPageView'])
  _paq.push(['enableLinkTracking'])

  const script = document.createElement('script')
  script.async = true
  script.src = `${base}/matomo.js`
  script.dataset.rkMatomo = '1'
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript?.parentNode?.insertBefore(script, firstScript)
}

function unloadMatomo(): void {
  document.querySelectorAll('script[data-rk-matomo]').forEach((node) => node.remove())
  delete window._paq
  document.documentElement.dataset.rkMatomoConsent = '0'
}

function trackSpaPageView(): void {
  if (typeof window === 'undefined' || !window._paq) return
  window._paq.push(['setCustomUrl', window.location.href])
  window._paq.push(['setDocumentTitle', document.title])
  window._paq.push(['trackPageView'])
}

export function MatomoTracker({ url, siteId }: MatomoTrackerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedKey = useRef<string | null>(null)

  useEffect(() => {
    function syncFromStore() {
      const state = readStoredConsent()
      const enabled = Boolean(state?.categories.statistics)
      document.documentElement.dataset.rkMatomoConsent = enabled ? '1' : '0'

      if (enabled) {
        const alreadyLoaded = Boolean(document.querySelector('script[data-rk-matomo]'))
        loadMatomo(url, siteId)
        if (!alreadyLoaded) {
          lastTrackedKey.current = pageKey()
        }
      } else {
        unloadMatomo()
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
  }, [url, siteId])

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
