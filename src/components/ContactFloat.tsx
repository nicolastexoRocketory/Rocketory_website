'use client'

import { useEffect, useRef, useState } from 'react'

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
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy !== null) return legacy === '1'
    return true
  } catch {
    return true
  }
}

export function ContactFloat() {
  const [collapsed, setCollapsed] = useState(true)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCollapsed(readCollapsedState())
  }, [])

  useEffect(() => {
    if (collapsed) return

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target
      if (!(target instanceof Node) || !wrapRef.current?.contains(target)) {
        setCollapsedState(true)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setCollapsedState(true)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [collapsed])

  function setCollapsedState(next: boolean) {
    setCollapsed(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`rk-contact-float-wrap${collapsed ? ' is-collapsed' : ' is-open'}`}
    >
      <div className="rk-contact-float-panel" role="dialog" aria-label="Kontakt">
        <button
          type="button"
          className="rk-contact-float__dismiss"
          onClick={() => setCollapsedState(true)}
          aria-label="Kontakt schließen"
        >
          <CloseIcon />
        </button>

        <div className="rk-contact-float__inner">
          <p className="rk-contact-float__note">Kostenlos · Antwort in 24&nbsp;h</p>

          <a href="/kontakt" className="rk-dot-cta rk-contact-float__primary">
            <span className="rk-dot-cta-label">Projekt anfragen</span>
            <span className="dot-ring" aria-hidden="true">
              <span />
            </span>
          </a>

          <a
            className="rk-contact-float__whatsapp"
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      <button
        type="button"
        className="rk-contact-float__trigger"
        onClick={() => setCollapsedState(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Kontakt anzeigen' : 'Kontakt schließen'}
      >
        <span className="rk-dot-cta-label">Kontakt</span>
        <span className="dot-ring" aria-hidden="true">
          <span />
        </span>
      </button>
    </div>
  )
}
