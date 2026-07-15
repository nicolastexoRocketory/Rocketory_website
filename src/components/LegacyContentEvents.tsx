'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Legacy-Skripte nach Hydration und Client-Navigation informieren. */
export function LegacyContentEvents() {
  const pathname = usePathname()

  useEffect(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new CustomEvent('rk:legacy-content'))
      const win = window as Window & { __RK_INIT_POST_FILTER?: () => void }
      win.__RK_INIT_POST_FILTER?.()
    })
  }, [pathname])

  return null
}
