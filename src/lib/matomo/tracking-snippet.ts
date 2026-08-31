function escapeJsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function normalizeTrackerBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (!trimmed) return trimmed
  if (trimmed.startsWith('//')) return trimmed
  return trimmed.replace(/^https?:\/\//, '//')
}

/** Inline head snippet — Matomo lädt sofort, trackt erst nach Cookie-Einwilligung. */
export function buildMatomoHeadScript(publicUrl: string, siteId: string): string {
  const base = normalizeTrackerBase(publicUrl)
  const safeSiteId = siteId.replace(/[^0-9]/g, '') || '1'
  const safeBase = escapeJsString(base)

  return [
    'var _paq = window._paq = window._paq || [];',
    '_paq.push([\'requireConsent\']);',
    `_paq.push(['setTrackerUrl', '${safeBase}/matomo.php']);`,
    `_paq.push(['setSiteId', '${safeSiteId}']);`,
    '_paq.push([\'enableLinkTracking\']);',
    '(function() {',
    `  var u='${safeBase}/';`,
    '  var d=document, g=d.createElement(\'script\'), s=d.getElementsByTagName(\'script\')[0];',
    '  g.async=true; g.src=u+\'matomo.js\'; s.parentNode.insertBefore(g,s);',
    '})();',
  ].join('\n')
}
