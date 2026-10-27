'use client'

import { useEffect, useState } from 'react'

import '@/styles/contact-float.css'

const SHOW_AFTER_PX = 120
const DISMISS_KEY = 'rk-website-check-float-dismissed'

export function ContactFloat() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1')
    } catch {
      setDismissed(false)
    }

    function update() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  function reopen() {
    setDismissed(false)
    try {
      window.localStorage.removeItem(DISMISS_KEY)
    } catch {
      /* ignore */
    }
  }

  const showCard = visible && !dismissed
  const showLauncher = visible && dismissed

  return (
    <>
      <button
        type="button"
        className={`rk-check-float-scrim${showCard ? ' is-visible' : ''}`}
        onClick={dismiss}
        aria-label="Hinweis schließen"
        aria-hidden={!showCard}
        tabIndex={showCard ? undefined : -1}
      />

      <aside
        className={`rk-check-float${showCard ? ' is-visible' : ''}`}
        aria-label="Unser neuer Website-Check"
        aria-hidden={!showCard}
      >
        <button
          type="button"
          className="rk-check-float-close"
          onClick={dismiss}
          aria-label="Hinweis schließen"
          tabIndex={showCard ? undefined : -1}
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="rk-check-float-media" aria-hidden="true">
          <picture>
            <source type="image/webp" srcSet="/assets/images/ki-check-hero-law.webp" />
            <img
              src="/assets/images/ki-check-hero-law.jpg"
              alt=""
              width="1024"
              height="630"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <p className="rk-check-float-badge">Unser neuer Website-Check</p>
        </div>

        <div className="rk-check-float-body">
          <p className="rk-check-float-kicker">KI | Neue Rechtslage</p>
          <p className="rk-check-float-title">60&nbsp;% aller Webseiten nicht mehr sicher?</p>
          <p className="rk-check-float-text">
            Neue Rechtslage durch die EU-KI-Verordnung: Die meisten Webseiten sind damit nicht mehr
            rechtssicher – Abmahnungen können drohen.
          </p>
          <a
            className="rk-btn-solid rk-check-float-cta"
            href="/ki-check"
            onClick={dismiss}
            tabIndex={showCard ? undefined : -1}
          >
            <span className="rk-btn-solid-label">Zum KI-Check</span>
          </a>
        </div>
      </aside>

      <button
        type="button"
        className={`rk-check-float-launcher${showLauncher ? ' is-visible' : ''}`}
        onClick={reopen}
        aria-label="Website-Check öffnen"
        aria-hidden={!showLauncher}
        tabIndex={showLauncher ? undefined : -1}
      >
        KI-Check
      </button>
    </>
  )
}
