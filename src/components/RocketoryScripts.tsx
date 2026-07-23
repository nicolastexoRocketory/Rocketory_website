'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

type RocketoryScriptsProps = {
  scripts: string[]
  withBlogSidebar?: boolean
}

const SCRIPT_VERSION = '28'

function withVersion(src: string): string {
  if (src.includes('?')) return src
  return `${src}?v=${SCRIPT_VERSION}`
}

function loadScript(src: string): Promise<void> {
  const versionedSrc = withVersion(src)
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${versionedSrc}"]`)) {
      resolve()
      return
    }

    document.querySelectorAll(`script[src="${src}"]`).forEach((node) => {
      node.remove()
    })

    const script = document.createElement('script')
    script.src = versionedSrc
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${versionedSrc}`))
    document.body.appendChild(script)
  })
}

async function initBlogSidebar() {
  await loadScript('/js/author-data.js')
  await Promise.all([
    loadScript('/js/components/blog-sidebar.js'),
    loadScript('/js/author-schema.js'),
    loadScript('/js/author-widget.js'),
  ])

  const mount = document.getElementById('rk-blog-sidebar-mount')
  if (!mount || document.querySelector('.rk-blog-sidebar')) return

  const components = (window as Window & { __RK_COMPONENTS?: Record<string, string> }).__RK_COMPONENTS
  if (components?.blogSidebar) {
    mount.innerHTML = components.blogSidebar
  }
}

function notifyLegacyScriptsReady() {
  document.dispatchEvent(new CustomEvent('rk:ready'))
  const win = window as Window & { __RK_INIT_POST_FILTER?: () => void }
  win.__RK_INIT_POST_FILTER?.()
}

function isModifiedClick(event: MouseEvent) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
}

function shouldSkipLink(link: HTMLAnchorElement) {
  const href = link.getAttribute('href')
  if (!href || href === '#' || href.startsWith('mailto:') || href.startsWith('tel:')) return true
  if (link.hasAttribute('download')) return true
  if (link.target === '_blank') return true
  return false
}

export function RocketoryScripts({ scripts, withBlogSidebar = false }: RocketoryScriptsProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function onLinkClick(event: MouseEvent) {
      if (isModifiedClick(event)) return

      const link = (event.target as Element | null)?.closest?.('a[href]')
      if (!(link instanceof HTMLAnchorElement) || shouldSkipLink(link)) return

      let url: URL
      try {
        url = new URL(link.href, window.location.href)
      } catch {
        return
      }

      if (url.origin !== window.location.origin) return

      const targetPath = url.pathname + url.search + url.hash
      const currentPath = window.location.pathname + window.location.search + window.location.hash
      if (targetPath === currentPath) return

      event.preventDefault()
      router.push(targetPath)
    }

    document.addEventListener('click', onLinkClick)
    return () => document.removeEventListener('click', onLinkClick)
  }, [router])

  useEffect(() => {
    let cancelled = false

    async function init() {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
      if (cancelled) return

      await Promise.all([
        loadScript('/js/scroll.js'),
        loadScript('/js/nav.js'),
        loadScript('/js/readmore.js'),
        loadScript('/js/brand-seal-parallax.js'),
        loadScript('/js/hero-parallax.js'),
        loadScript('/js/scroll-reveal.js'),
      ])

      if (withBlogSidebar) {
        await initBlogSidebar()
      }

      const pageScripts = scripts.filter(
        (src) =>
          !src.includes('scroll.js') &&
          !src.includes('nav.js') &&
          !src.includes('readmore.js') &&
          !src.includes('brand-seal-parallax.js') &&
          !src.includes('hero-parallax.js') &&
          !src.includes('scroll-reveal.js'),
      )

      if (pageScripts.length > 0) {
        await Promise.all(pageScripts.map((src) => loadScript(src)))
      }

      if (!cancelled) {
        notifyLegacyScriptsReady()
        const win = window as Window & {
          __RK_BOOT_PARALLAX?: () => void
          __RK_BOOT_SCROLL_REVEAL?: () => void
        }
        win.__RK_BOOT_PARALLAX?.()
        win.__RK_BOOT_SCROLL_REVEAL?.()
      }
    }

    init().catch((error) => {
      console.error('[Rocketory] Scripts konnten nicht geladen werden:', error)
    })

    return () => {
      cancelled = true
    }
  }, [scripts, withBlogSidebar, pathname])

  return null
}
