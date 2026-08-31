'use client'

import { useEffect, useState } from 'react'

import '@/styles/back-to-top.css'

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M6 11l6-6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const top = document.getElementById('top')

    if (top && typeof window.rkSmoothScrollTo === 'function') {
      window.rkSmoothScrollTo(top)
      return
    }

    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      type="button"
      className={`rk-back-to-top${visible ? ' is-visible' : ''}`}
      aria-label="Nach oben scrollen"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={scrollToTop}
    >
      <ArrowUpIcon />
    </button>
  )
}

declare global {
  interface Window {
    rkSmoothScrollTo?: (target: Element) => void
  }
}
