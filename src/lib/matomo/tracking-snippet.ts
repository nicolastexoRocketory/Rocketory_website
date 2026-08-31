function escapeJsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function normalizeTrackerBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (!trimmed) return trimmed
  if (trimmed.startsWith('//')) return trimmed
  return trimmed.replace(/^https?:\/\//, '//')
}

/** Matomo-Standardsnippet fürs Head — Cookie-Consent erst nach Banner-Einwilligung. */
export function buildMatomoHeadScript(publicUrl: string, siteId: string): string {
  const base = normalizeTrackerBase(publicUrl)
  const safeSiteId = siteId.replace(/[^0-9]/g, '') || '1'
  const safeBase = escapeJsString(base)

  return [
    'var _paq = window._paq = window._paq || [];',
    '_paq.push([\'requireCookieConsent\']);',
    '/* tracker methods like "setCustomDimension" should be called before "trackPageView" */',
    '_paq.push([\'trackPageView\']);',
    '_paq.push([\'enableLinkTracking\']);',
    '(function() {',
    `  var u='${safeBase}/';`,
    `  _paq.push(['setTrackerUrl', u+'matomo.php']);`,
    `  _paq.push(['setSiteId', '${safeSiteId}']);`,
    '  var d=document, g=d.createElement(\'script\'), s=d.getElementsByTagName(\'script\')[0];',
    '  g.async=true; g.src=u+\'matomo.js\'; s.parentNode.insertBefore(g,s);',
    '})();',
  ].join('\n')
}
