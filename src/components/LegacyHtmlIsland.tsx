'use client'

import { useLayoutEffect, useRef } from 'react'

type LegacyHtmlIslandProps = {
  html: string
  className?: string
}

/** SSR-HTML behalten: React 19 kann bei innerHTML Nav/Footer nach Hydration entfernen. */
export function LegacyHtmlIsland({ html, className = 'rk-legacy-html' }: LegacyHtmlIslandProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const hasExpectedContent = node.querySelector('.rk-nav, .rk-footer, .rk-menu-panel')
    if (!hasExpectedContent) {
      node.innerHTML = html
    }
  }, [html])

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
