export const CONSENT_COOKIE = 'rk_consent'
export const CONSENT_STORAGE_KEY = 'rk_consent_v1'
export const CONSENT_VERSION = 1
export const CONSENT_MAX_AGE_DAYS = 365
export const CONSENT_CHANGED_EVENT = 'rk:consent-changed'
export const CONSENT_OPEN_EVENT = 'rk:consent-open'

export type ConsentCategories = {
  necessary: true
  external: boolean
}

export type ConsentState = {
  version: number
  decidedAt: string
  categories: ConsentCategories
}

export const DEFAULT_CONSENT: ConsentState = {
  version: CONSENT_VERSION,
  decidedAt: '',
  categories: {
    necessary: true,
    external: false,
  },
}

export function createConsentState(external: boolean): ConsentState {
  return {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    categories: {
      necessary: true,
      external,
    },
  }
}

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<ConsentState>
    if (!data || typeof data !== 'object') return null
    if (data.version !== CONSENT_VERSION) return null
    if (!data.categories || typeof data.categories !== 'object') return null
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof data.decidedAt === 'string' ? data.decidedAt : '',
      categories: {
        necessary: true,
        external: Boolean(data.categories.external),
      },
    }
  } catch {
    return null
  }
}

export function readConsentCookie(cookieHeader?: string): ConsentState | null {
  if (typeof document !== 'undefined' && !cookieHeader) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
    return match ? parseConsent(decodeURIComponent(match[1])) : null
  }

  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  return match ? parseConsent(decodeURIComponent(match[1])) : null
}

export function writeConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return

  const payload = JSON.stringify(state)
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(payload)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, payload)
  } catch {
    // ignore storage errors (private mode etc.)
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: state }))
}

export function readStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null

  try {
    const fromStorage = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY))
    if (fromStorage) return fromStorage
  } catch {
    // ignore
  }

  return readConsentCookie()
}

export function openConsentPreferences(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
}

export function applyExternalConsent(enabled: boolean): void {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.rkExternalConsent = enabled ? '1' : '0'

  document.querySelectorAll<HTMLIFrameElement>('iframe[data-rk-google-maps-embed]').forEach((iframe) => {
    const dataSrc = iframe.getAttribute('data-src')
    const src = iframe.getAttribute('src')

    if (enabled) {
      const url = dataSrc || src
      if (url && src !== url) iframe.setAttribute('src', url)
      if (!dataSrc && url) iframe.setAttribute('data-src', url)
    } else if (src) {
      if (!dataSrc) iframe.setAttribute('data-src', src)
      iframe.removeAttribute('src')
    }
  })

  document.querySelectorAll<HTMLElement>('[data-rk-consent-gate="external"]').forEach((gate) => {
    gate.hidden = enabled
  })
}
