export type ContentCategoryFilter = {
  slug: string
  title: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildCategoryFilterHtml(
  categories: ContentCategoryFilter[],
  ariaLabel = 'Einträge filtern',
): string {
  const categoryButtons = categories
    .map(
      (category) =>
        `<button type="button" class="rk-post-filter-btn" data-filter="${escapeHtml(category.slug)}" aria-pressed="false">${escapeHtml(category.title)}</button>`,
    )
    .join('\n          ')

  return `<div class="rk-post-filter" data-rk-post-filter role="toolbar" aria-label="${escapeHtml(ariaLabel)}">
          <button type="button" class="rk-post-filter-btn is-active" data-filter="all" aria-pressed="true">Alle</button>
          ${categoryButtons}
        </div>`
}

export function injectContentListing(
  html: string,
  cardsHtml: string,
  categories: ContentCategoryFilter[],
  ariaLabel = 'Einträge filtern',
): string {
  const filterHtml = buildCategoryFilterHtml(categories, ariaLabel)

  return html
    .replace(/<div class="rk-post-filter" data-rk-post-filter[\s\S]*?<\/div>/, filterHtml)
    .replace(
      /(<div class="rk-post-grid" data-rk-post-grid>)[\s\S]*?(<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>)/,
      `$1\n${cardsHtml}\n        $2`,
    )
}
