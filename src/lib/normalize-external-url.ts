/** Entfernt versehentliche Leerzeichen in externen URLs (Legacy-HTML). */
export function normalizeExternalUrl(url: string): string {
  return url.replace(/\s+/g, '')
}

/** Entfernt Leerzeichen nach Punkten in URLs/E-Mails (Legacy-Anti-Scraping-Artefakte). */
export function normalizeLegacySpacedUrls(html: string): string {
  let result = html

  for (const tld of ['de', 'com', 'net', 'org', 'io', 'html'] as const) {
    result = result.replace(new RegExp(`\\. ${tld}\\b`, 'g'), `.${tld}`)
  }

  return result
    .replace(/www\. /g, 'www.')
    .replace(/window\. location\. /g, 'window.location.')
    .replace(/mail\. /g, 'mail.')
    .replace(/policies\. /g, 'policies.')
    .replace(/developers\. /g, 'developers.')
    .replace(/unsplash\. /g, 'unsplash.')
    .replace(/payloadcms\. /g, 'payloadcms.')
    .replace(/git-scm\. /g, 'git-scm.')
    .replace(/pexels\. /g, 'pexels.')
    .replace(/fairflock\. /g, 'fairflock.')
    .replace(/agenturserver\. /g, 'agenturserver.')
    .replace(/remisebuende\. /g, 'remisebuende.')
    .replace(/google\. /g, 'google.')
    .replace(/w3\. /g, 'w3.')
    .replace(/php\. /g, 'php.')
    .replace(/figma\. /g, 'figma.')
    .replace(/nicolas\. /g, 'nicolas.')
    .replace(/nicolastexo\. /g, 'nicolastexo.')
}
