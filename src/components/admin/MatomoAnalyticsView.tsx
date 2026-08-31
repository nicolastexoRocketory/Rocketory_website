import {
  fetchMatomoSummary,
  getMatomoAdminEmbedUrl,
  getMatomoAdminUrl,
  isMatomoConfigured,
} from '@/lib/matomo'

import './matomo-analytics.css'

function formatNumber(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value)
}

export async function MatomoAnalyticsView() {
  if (!isMatomoConfigured()) {
    return (
      <div className="rk-matomo-analytics">
        <div className="rk-matomo-empty">
          <h1 className="rk-matomo-title">Besucherstatistik</h1>
          <p>
            Matomo ist noch nicht konfiguriert. Setze in der <code>.env</code> mindestens{' '}
            <code>MATOMO_URL</code>, <code>MATOMO_SITE_ID</code> und <code>MATOMO_AUTH_TOKEN</code>.
          </p>
          <p>
            Für lokales Testen: <code>docker compose -f docker-compose.matomo.yml up -d</code> — danach
            Matomo unter <code>http://localhost:8080</code> einrichten und Token erzeugen.
          </p>
        </div>
      </div>
    )
  }

  let summary
  let error: string | null = null

  try {
    summary = await fetchMatomoSummary('month', 'today')
  } catch (err) {
    error = err instanceof Error ? err.message : 'Matomo API nicht erreichbar'
  }

  const embedUrl = getMatomoAdminEmbedUrl('month', 'today')
  const adminUrl = getMatomoAdminUrl()

  return (
    <div className="rk-matomo-analytics">
      <header className="rk-matomo-header">
        <div>
          <p className="rk-matomo-kicker">Analytics</p>
          <h1 className="rk-matomo-title">Besucherstatistik</h1>
          <p className="rk-matomo-subtitle">Self-hosted Matomo — KPIs der letzten 30 Tage</p>
        </div>
        {adminUrl ? (
          <a className="rk-matomo-external" href={adminUrl} target="_blank" rel="noreferrer">
            Matomo öffnen ↗
          </a>
        ) : null}
      </header>

      {error ? (
        <div className="rk-matomo-error" role="alert">
          {error}
        </div>
      ) : summary ? (
        <div className="rk-matomo-kpis">
          <article className="rk-matomo-kpi">
            <span className="rk-matomo-kpi-label">Besuche</span>
            <strong className="rk-matomo-kpi-value">{formatNumber(summary.visits)}</strong>
          </article>
          <article className="rk-matomo-kpi">
            <span className="rk-matomo-kpi-label">Seitenaufrufe</span>
            <strong className="rk-matomo-kpi-value">{formatNumber(summary.pageviews)}</strong>
          </article>
          <article className="rk-matomo-kpi">
            <span className="rk-matomo-kpi-label">Unique Besucher</span>
            <strong className="rk-matomo-kpi-value">{formatNumber(summary.uniqueVisitors)}</strong>
          </article>
          <article className="rk-matomo-kpi">
            <span className="rk-matomo-kpi-label">Absprungrate</span>
            <strong className="rk-matomo-kpi-value">{summary.bounceRate}</strong>
          </article>
          <article className="rk-matomo-kpi">
            <span className="rk-matomo-kpi-label">Ø Verweildauer</span>
            <strong className="rk-matomo-kpi-value">{summary.avgTimeOnSite}</strong>
          </article>
          <article className="rk-matomo-kpi">
            <span className="rk-matomo-kpi-label">Aktionen / Besuch</span>
            <strong className="rk-matomo-kpi-value">{summary.actionsPerVisit}</strong>
          </article>
        </div>
      ) : null}

      {embedUrl ? (
        <section className="rk-matomo-dashboard">
          <h2 className="rk-matomo-dashboard-title">Matomo-Dashboard</h2>
          <iframe
            className="rk-matomo-iframe"
            src={embedUrl}
            title="Matomo Dashboard"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </section>
      ) : null}
    </div>
  )
}

export default MatomoAnalyticsView
