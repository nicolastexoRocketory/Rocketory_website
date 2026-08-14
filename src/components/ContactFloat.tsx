'use client'

import { useEffect, useState } from 'react'

import { WHATSAPP_HREF } from '@/lib/whatsapp'

import '@/styles/contact-float.css'

const STORAGE_KEY = 'rk-contact-float-collapsed'
const LEGACY_STORAGE_KEY = 'rk-whatsapp-collapsed'

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.52 3.8 1.44 5.4L2 22l4.96-1.52a9.9 9.9 0 004.98 1.34h.01c5.46 0 9.89-4.4 9.89-9.82S17.5 2 12.04 2zm5.76 13.95c-.24.68-1.4 1.24-1.94 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.19-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.6.82 2.01.89 2.15.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.65-.07.17-.2.74-.86.94-1.15.2-.3.4-.24.67-.14.27.1 1.72.81 2.01.96.3.15.49.22.56.34.08.13.08.74-.16 1.42z" />
    </svg>
  )
}

function readCollapsedState(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === '1'
    return localStorage.getItem(LEGACY_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function ContactFloat() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(readCollapsedState())
  }, [])

  function setCollapsedState(next: boolean) {
    setCollapsed(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div className={`rk-contact-float-wrap${collapsed ? ' is-collapsed' : ''}`}>
      <div className="rk-contact-float-panel">
        <button
          type="button"
          className="rk-contact-float__dismiss"
          onClick={() => setCollapsedState(true)}
          aria-label="Kontakt-Hinweis ausblenden"
        >
          <CloseIcon />
        </button>

        <div className="rk-contact-float__inner">
          <p className="rk-contact-float__kicker">Kontakt</p>
          <p className="rk-contact-float__title">Lass uns sprechen.</p>
          <p className="rk-contact-float__desc">
            Kostenlos & unverbindlich · Antwort innerhalb von 24h
          </p>

          <div className="rk-contact-float__actions">
            <a href="/kontakt" className="rk-dot-cta rk-contact-float__primary">
              <span className="rk-dot-cta-label">Projekt anfragen</span>
              <span className="dot-ring" aria-hidden="true">
                <span />
              </span>
            </a>

            <a
              className="rk-whatsapp-cta"
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              <span>Lieber per WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="rk-contact-float__expand"
        onClick={() => setCollapsedState(false)}
        aria-label="Kontakt-Hinweis anzeigen"
      >
        <span className="rk-dot-cta-label">Kontakt</span>
        <span className="dot-ring" aria-hidden="true">
          <span />
        </span>
      </button>
    </div>
  )
}
