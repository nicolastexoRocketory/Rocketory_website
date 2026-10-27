export type ContentSection = {
  title: string
  body: string
  id?: string | null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
}

export function sectionAnchor(title: string, index: number): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `toc-${base || `abschnitt-${index + 1}`}`
}

function normalizeSectionBody(body: string): string {
  const trimmed = body.trim()
  if (!trimmed) return ''
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed

  return trimmed
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

function normalizeIntroHtml(intro: string | null | undefined): string {
  const trimmed = (intro || '').trim()
  if (!trimmed) return ''
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed
  return `<p class="rk-blog-intro">${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>`
}

/** Baut Intro + TOC + Abschnitte aus den Backend-Feldern. */
export function buildHtmlFromContentSections(
  sections: ContentSection[] | null | undefined,
  intro?: string | null,
): string {
  const items = (sections || []).filter((section) => section?.title?.trim() && section?.body?.trim())
  const introHtml = normalizeIntroHtml(intro)
  if (items.length === 0) return introHtml

  const usedIds = new Set<string>()
  const resolved = items.map((section, index) => {
    // section.id ist die Payload-Array-Row-ID, kein HTML-Anker
    let id = sectionAnchor(section.title, index)
    if (usedIds.has(id)) id = `${id}-${index + 1}`
    usedIds.add(id)
    return { ...section, id }
  })

  const tocRows = resolved
    .map(
      (section) =>
        `<tr><td><a href="#${escapeHtml(section.id)}">${escapeHtml(section.title.trim())}</a></td></tr>`,
    )
    .join('\n')

  const sectionsHtml = resolved
    .map((section) => {
      return `<h2 id="${escapeHtml(section.id)}">${escapeHtml(section.title.trim())}</h2>\n${normalizeSectionBody(section.body)}`
    })
    .join('\n\n')

  return `
${introHtml}

<nav class="rk-blog-toc" aria-label="Inhaltsverzeichnis">
  <p class="rk-blog-toc-title">Inhaltsverzeichnis</p>
  <table class="rk-blog-toc-list" role="list">
    <tbody>
      ${tocRows}
    </tbody>
  </table>
</nav>

${sectionsHtml}
`.trim()
}

export function resolveArticleBodyHtml(options: {
  contentSections?: ContentSection[] | null
  contentIntro?: string | null
  legacyHtml?: string | null
}): string {
  const fromSections = buildHtmlFromContentSections(options.contentSections, options.contentIntro)
  if (fromSections) return fromSections
  return (options.legacyHtml || '').trim()
}

export type ParsedLegacyArticle = {
  intro: string
  sections: ContentSection[]
  warnings: string[]
}

function stripTags(value: string): string {
  return decodeBasicEntities(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeComparableText(html: string): string {
  return stripTags(html)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Zerlegt Legacy-Artikel-HTML in Einleitung + Abschnitte.
 * TOC-Anker (auch h3) und h2-Überschriften werden als Abschnittsgrenzen genutzt.
 */
export function parseLegacyArticleHtml(legacyHtml: string): ParsedLegacyArticle {
  const warnings: string[] = []
  let html = (legacyHtml || '').trim()
  if (!html) return { intro: '', sections: [], warnings: ['Leerer legacyHtml'] }

  const tocMatch = html.match(/<nav class="rk-blog-toc"[\s\S]*?<\/nav>/i)
  const tocLabels = new Map<string, string>()
  if (tocMatch) {
    for (const [, id, label] of tocMatch[0].matchAll(/<a href="#([^"]+)">([\s\S]*?)<\/a>/gi)) {
      tocLabels.set(id, stripTags(label))
    }
    html = html.replace(tocMatch[0], '\n')
  }

  type HeadingHit = { index: number; end: number; id: string; title: string; raw: string }
  const hits: HeadingHit[] = []

  const headingRe = /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi
  for (const match of html.matchAll(headingRe)) {
    const full = match[0]
    const attrs = match[2] || ''
    const inner = match[3] || ''
    const index = match.index ?? 0
    const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i)
    const id = idMatch?.[1]?.trim() || ''
    const title = stripTags(inner)
    const isTocTarget = id && tocLabels.has(id)
    const isH2 = /^h2$/i.test(match[1])
    if (!title) continue
    if (!isTocTarget && !isH2) continue
    hits.push({
      index,
      end: index + full.length,
      id: id || '',
      // Überschriftstext behalten (inkl. Nummerierung); TOC-Label nur als Fallback
      title: title || tocLabels.get(id) || 'Abschnitt',
      raw: full,
    })
  }

  hits.sort((a, b) => a.index - b.index)

  // Duplikate an gleicher Position / verschachtelte Treffer entfernen
  const unique: HeadingHit[] = []
  for (const hit of hits) {
    const prev = unique[unique.length - 1]
    if (prev && hit.index < prev.end) {
      warnings.push(`Überschrift innerhalb eines anderen Abschnitts übersprungen: ${hit.title}`)
      continue
    }
    unique.push(hit)
  }

  if (unique.length === 0) {
    warnings.push('Keine Abschnittsüberschriften gefunden – gesamter Inhalt als ein Abschnitt')
    return {
      intro: '',
      sections: [{ title: 'Inhalt', body: html.trim() }],
      warnings,
    }
  }

  const intro = html.slice(0, unique[0].index).trim()
  const sections: ContentSection[] = []

  for (let i = 0; i < unique.length; i++) {
    const hit = unique[i]
    const bodyStart = hit.end
    const bodyEnd = i + 1 < unique.length ? unique[i + 1].index : html.length
    const body = html.slice(bodyStart, bodyEnd).trim()
    if (!body) {
      warnings.push(`Leerer Abschnitt: ${hit.title}`)
    }
    sections.push({
      title: hit.title,
      body,
      id: hit.id || undefined,
    })
  }

  // TOC-Einträge ohne Heading melden
  for (const [id, label] of tocLabels) {
    if (!sections.some((section) => section.id === id)) {
      warnings.push(`TOC-Eintrag ohne Abschnitt: ${label} (#${id})`)
    }
  }

  return { intro, sections, warnings }
}

/** Prüft, ob der sichtbare Text nach der Dekompilierung erhalten bleibt. */
export function legacyParseCoverage(
  legacyHtml: string,
  parsed: ParsedLegacyArticle,
): { ok: boolean; originalChars: number; rebuiltChars: number; missingSample: string } {
  const withoutToc = (legacyHtml || '').replace(/<nav class="rk-blog-toc"[\s\S]*?<\/nav>/gi, ' ')
  const original = normalizeComparableText(withoutToc)
  const rebuilt = normalizeComparableText(
    `${parsed.intro}\n${parsed.sections.map((s) => `${s.title}\n${s.body}`).join('\n')}`,
  )

  let missingSample = ''
  if (original !== rebuilt) {
    // grobe Diff-Hilfe: erstes abweichendes Fenster
    const minLen = Math.min(original.length, rebuilt.length)
    let i = 0
    while (i < minLen && original[i] === rebuilt[i]) i++
    missingSample = `orig@${i}:…${original.slice(Math.max(0, i - 20), i + 60)}… | rebuild:…${rebuilt.slice(Math.max(0, i - 20), i + 60)}…`
  }

  return {
    ok: original === rebuilt,
    originalChars: original.length,
    rebuiltChars: rebuilt.length,
    missingSample,
  }
}
