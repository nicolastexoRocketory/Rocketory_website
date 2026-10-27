export const LEGACY_PAGE_ROUTES: Record<string, string> = {
  'index.html': '/',
  'kontakt.html': '/kontakt',
  'ki-check.html': '/ki-check',
  'angebote.html': '/leistungen',
  'leistungen.html': '/leistungen',
  'webdesign.html': '/webdesign',
  'seo.html': '/seo',
  'wartung.html': '/wartung',
  'technologien.html': '/technologien',
  'agentur.html': '/agentur',
  'agentur/buende.html': '/agentur/buende',
  'standorte.html': '/standorte',
  'blog.html': '/blog',
  'projekte.html': '/projekte',
  'referenzen.html': '/projekte',
  'impressum.html': '/impressum',
  'datenschutz.html': '/datenschutz',
}

export function resolveLegacyHref(href: string): string {
  if (!href || href.startsWith('#') || /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href
  }

  let result = href

  for (const [file, route] of Object.entries(LEGACY_PAGE_ROUTES)) {
    result = result.replace(
      new RegExp(`^${file.replace('.', '\\.')}(#.*)?$`),
      (_, hash) => `${route}${hash || ''}`,
    )
  }

  result = result.replace(/^blog\/([^#]+)\.html(#.*)?$/, '/blog/$1$2')
  result = result.replace(/^\.\.\/blog\/([^#]+)\.html(#.*)?$/, '/blog/$1$2')
  result = result.replace(/^projekte\/([^#]+)\.html(#.*)?$/, '/projekte/$1$2')
  result = result.replace(/^\.\.\/projekte\/([^#]+)\.html(#.*)?$/, '/projekte/$1$2')
  result = result.replace(/^\.\.\/index\.html(#.*)?$/, '/$1')
  result = result.replace(/^index\.html(#.*)?$/, '/$1')
  result = result.replace(/^\.\.\/([^#]+\.html)(#.*)?$/, (_, page, hash) => {
    const route = LEGACY_PAGE_ROUTES[page] || `/${page.replace('.html', '')}`
    return `${route}${hash || ''}`
  })

  return result
}

export function transformLinks(html: string): string {
  let result = html

  for (const [file, route] of Object.entries(LEGACY_PAGE_ROUTES)) {
    result = result.replace(
      new RegExp(`href="${file.replace('.', '\\.')}(#[^"]*)?"`, 'g'),
      (_, hash) => `href="${route}${hash || ''}"`,
    )
  }

  result = result.replace(/href="blog\/([^"]+)\.html"/g, 'href="/blog/$1"')
  result = result.replace(/href="\.\.\/blog\/([^"]+)\.html"/g, 'href="/blog/$1"')
  result = result.replace(/href="projekte\/([^"]+)\.html"/g, 'href="/projekte/$1"')
  result = result.replace(/href="\.\.\/projekte\/([^"]+)\.html"/g, 'href="/projekte/$1"')
  result = result.replace(/href="agentur\/buende\.html(#[^"]*)?"/g, 'href="/agentur/buende$1"')
  result = result.replace(/href="\.\.\/agentur\/buende\.html(#[^"]*)?"/g, 'href="/agentur/buende$1"')
  result = result.replace(/href="\.\.\/referenzen\.html"/g, 'href="/projekte"')
  result = result.replace(/href="referenzen\.html"/g, 'href="/projekte"')
  result = result.replace(/href="\.\.\/index\.html(#[^"]*)"/g, 'href="/$1"')
  result = result.replace(/href="\.\.\/index\.html"/g, 'href="/"')
  result = result.replace(/href="index\.html(#[^"]*)"/g, 'href="/$1"')
  result = result.replace(/href="index\.html"/g, 'href="/"')
  result = result.replace(/href="\.\.\/([^"]+\.html)(#[^"]*)?"/g, (_, page, hash) => {
    const route = LEGACY_PAGE_ROUTES[page] || `/${page.replace('.html', '')}`
    return `href="${route}${hash || ''}"`
  })

  return result
}
