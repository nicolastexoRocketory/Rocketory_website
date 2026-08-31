export type MatomoConfig = {
  url: string
  siteId: string
  authToken: string
  publicUrl: string
  publicSiteId: string
}

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '')
}

export function getMatomoConfig(): MatomoConfig | null {
  const url = process.env.MATOMO_URL?.trim()
  const siteId = process.env.MATOMO_SITE_ID?.trim()
  const authToken = process.env.MATOMO_AUTH_TOKEN?.trim()

  if (!url || !siteId || !authToken) return null

  const publicUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_MATOMO_URL?.trim() || url)
  const publicSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID?.trim() || siteId

  return {
    url: normalizeBaseUrl(url),
    siteId,
    authToken,
    publicUrl,
    publicSiteId,
  }
}

export function isMatomoConfigured(): boolean {
  return getMatomoConfig() !== null
}

export function isMatomoTrackingConfigured(): boolean {
  const publicUrl = process.env.NEXT_PUBLIC_MATOMO_URL?.trim()
  const publicSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID?.trim()
  return Boolean(publicUrl && publicSiteId)
}
