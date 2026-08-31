import { getMatomoConfig } from './config'

export type MatomoPeriod = 'day' | 'week' | 'month' | 'year' | 'range'

export type MatomoSummary = {
  period: MatomoPeriod
  date: string
  visits: number
  pageviews: number
  uniqueVisitors: number
  bounceRate: string
  avgTimeOnSite: string
  actionsPerVisit: number
}

type MatomoApiRow = Record<string, string | number>

async function matomoApi<T extends MatomoApiRow>(
  method: string,
  params: Record<string, string> = {},
): Promise<T> {
  const config = getMatomoConfig()
  if (!config) {
    throw new Error('Matomo ist nicht konfiguriert (MATOMO_URL, MATOMO_SITE_ID, MATOMO_AUTH_TOKEN).')
  }

  const body = new URLSearchParams({
    module: 'API',
    method,
    idSite: config.siteId,
    format: 'JSON',
    token_auth: config.authToken,
    ...params,
  })

  const response = await fetch(`${config.url}/index.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Matomo API Fehler (${response.status})`)
  }

  const data = (await response.json()) as T | { result?: string; message?: string }

  if (data && typeof data === 'object' && 'result' in data && data.result === 'error') {
    throw new Error(typeof data.message === 'string' ? data.message : 'Matomo API Fehler')
  }

  return data as T
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export async function fetchMatomoSummary(
  period: MatomoPeriod = 'month',
  date = 'today',
): Promise<MatomoSummary> {
  const row = await matomoApi<MatomoApiRow>('VisitsSummary.get', {
    period,
    date,
  })

  const visits = Number(row.nb_visits) || 0
  const pageviews = Number(row.nb_actions) || 0
  const uniqueVisitors = Number(row.nb_uniq_visitors) || visits
  const bounceRate = `${Number(row.bounce_rate ?? 0).toFixed(1)} %`
  const avgTimeOnSite = formatDuration(Number(row.avg_time_on_site) || 0)
  const actionsPerVisit = visits > 0 ? Math.round((pageviews / visits) * 10) / 10 : 0

  return {
    period,
    date,
    visits,
    pageviews,
    uniqueVisitors,
    bounceRate,
    avgTimeOnSite,
    actionsPerVisit,
  }
}

export function getMatomoAdminEmbedUrl(period: MatomoPeriod = 'month', date = 'today'): string | null {
  const config = getMatomoConfig()
  if (!config) return null

  const params = new URLSearchParams({
    module: 'Widgetize',
    action: 'iframe',
    moduleToWidgetize: 'Dashboard',
    actionToWidgetize: 'index',
    idSite: config.siteId,
    period,
    date,
    token_auth: config.authToken,
  })

  return `${config.url}/index.php?${params.toString()}`
}

export function getMatomoAdminUrl(): string | null {
  const config = getMatomoConfig()
  if (!config) return null
  return `${config.url}/index.php?module=CoreHome&action=index&idSite=${config.siteId}`
}
