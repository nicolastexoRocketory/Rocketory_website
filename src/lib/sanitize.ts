/**
 * XSS helpers without external deps.
 * Form fields → plain text. CMS HTML → strip dangerous tags/attrs (allowlist-oriented).
 */

const HTML_TAG_RE = /<[a-z][\s\S]*>/i

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code)
      return Number.isFinite(n) ? String.fromCharCode(n) : ''
    })
}

function stripTagsKeepText(value: string): string {
  return decodeBasicEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
}

/** Strip tags → single-line plain text (names, email, phone, …). */
export function toPlainText(value: string): string {
  return stripTagsKeepText(value).replace(/\s+/g, ' ').trim()
}

/** Strip tags but keep newlines (message bodies). */
export function toPlainTextMultiline(value: string): string {
  return stripTagsKeepText(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test(value)
}

const DANGEROUS_TAGS =
  /<\/?(?:script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option|svg|math|template|noscript)(?:\s[^>]*)?>/gi

const EVENT_HANDLER_ATTR =
  /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

const DANGEROUS_URL_ATTR =
  /(\s+(?:href|src|xlink:href|formaction|action)\s*=\s*)(["']?)\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"'>\s]*/gi

const SRCDOC_ATTR = /\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi

/**
 * Light sanitizer for trusted-editor CMS HTML before public render.
 * Removes scripts/iframes/event handlers and javascript: URLs. Not a full HTML parser.
 */
export function sanitizeCmsHtml(html: string): string {
  if (!html) return ''
  let out = html
  // Iteratively strip nested script/style etc.
  for (let i = 0; i < 5; i += 1) {
    const next = out
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(DANGEROUS_TAGS, '')
      .replace(EVENT_HANDLER_ATTR, '')
      .replace(SRCDOC_ATTR, '')
      .replace(DANGEROUS_URL_ATTR, '$1$2#')
    if (next === out) break
    out = next
  }
  return out
}

/** Only allow Google Maps embed / link hosts. */
export function sanitizeGoogleMapsUrl(
  value: string | null | undefined,
  kind: 'embed' | 'link',
): string {
  const raw = (value || '').trim()
  if (!raw) return ''

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return ''
  }

  if (url.protocol !== 'https:') return ''

  const host = url.hostname.toLowerCase()
  const embedHosts = new Set(['www.google.com', 'google.com', 'maps.google.com'])
  const linkHosts = new Set([
    'www.google.com',
    'google.com',
    'maps.google.com',
    'maps.app.goo.gl',
    'goo.gl',
  ])

  if (kind === 'embed') {
    if (!embedHosts.has(host)) return ''
    if (!url.pathname.startsWith('/maps/embed')) return ''
  } else if (!linkHosts.has(host)) {
    return ''
  }

  return url.toString()
}
