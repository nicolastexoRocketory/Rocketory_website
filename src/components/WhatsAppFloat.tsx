'use client'

import { useEffect, useState } from 'react'

import { WHATSAPP_HREF } from '@/lib/whatsapp'

import '@/styles/whatsapp-float.css'

const STORAGE_KEY = 'rk-whatsapp-collapsed'

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WhatsAppFloat() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setCollapsed(false)
    }
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
    <div className={`rk-whatsapp-float-wrap${collapsed ? ' is-collapsed' : ''}`}>
      <div className="rk-whatsapp-float-panel">
        <button
          type="button"
          className="rk-whatsapp-float__collapse"
          onClick={() => setCollapsedState(true)}
          aria-label="WhatsApp-Hinweis einklappen"
        >
          <ChevronDownIcon />
        </button>

        <a
          className="rk-whatsapp-float"
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Per WhatsApp schreiben"
        >
          <span className="rk-whatsapp-float__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.52 3.8 1.44 5.4L2 22l4.96-1.52a9.9 9.9 0 004.98 1.34h.01c5.46 0 9.89-4.4 9.89-9.82S17.5 2 12.04 2zm5.76 13.95c-.24.68-1.4 1.24-1.94 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.19-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.6.82 2.01.89 2.15.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.65-.07.17-.2.74-.86.94-1.15.2-.3.4-.24.67-.14.27.1 1.72.81 2.01.96.3.15.49.22.56.34.08.13.08.74-.16 1.42z" />
            </svg>
          </span>
          <span className="rk-whatsapp-float__copy">
            <span className="rk-whatsapp-float__kicker">WhatsApp</span>
            <span className="rk-whatsapp-float__title">Schreib uns.</span>
            <span className="rk-whatsapp-float__desc">
              Unverbindlich und ohne Formular – wir melden uns persönlich.
            </span>
          </span>
        </a>
      </div>

      <button
        type="button"
        className="rk-whatsapp-float__expand"
        onClick={() => setCollapsedState(false)}
        aria-label="WhatsApp-Hinweis anzeigen"
      >
        <span className="rk-whatsapp-float__expand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.52 3.8 1.44 5.4L2 22l4.96-1.52a9.9 9.9 0 004.98 1.34h.01c5.46 0 9.89-4.4 9.89-9.82S17.5 2 12.04 2zm5.76 13.95c-.24.68-1.4 1.24-1.94 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.19-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.6.82 2.01.89 2.15.07.15.12.32.02.51-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.47.12.65-.07.17-.2.74-.86.94-1.15.2-.3.4-.24.67-.14.27.1 1.72.81 2.01.96.3.15.49.22.56.34.08.13.08.74-.16 1.42z" />
          </svg>
        </span>
        <span className="rk-whatsapp-float__expand-chevron" aria-hidden="true">
          <ChevronUpIcon />
        </span>
      </button>
    </div>
  )
}
