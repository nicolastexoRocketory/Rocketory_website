/** Entfernt versehentliche Leerzeichen in externen URLs (Legacy-HTML). */
export function normalizeExternalUrl(url: string): string {
  return url.replace(/\s+/g, '')
}
