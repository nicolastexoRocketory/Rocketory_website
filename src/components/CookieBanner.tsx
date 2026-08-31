'use client'

import { useEffect, useState } from 'react'

import {
  applyConsent,
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  createConsentState,
  createFullConsentState,
  createMinimalConsentState,
  readStoredConsent,
  type ConsentState,
  writeConsent,
} from '@/lib/consent'

import '@/styles/cookie-banner.css'

type View = 'banner' | 'settings' | 'hidden'

export function CookieBanner() {
  const [view, setView] = useState<View>('hidden')
  const [external, setExternal] = useState(false)
  const [statistics, setStatistics] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = readStoredConsent()
    if (existing) {
      setExternal(existing.categories.external)
      setStatistics(existing.categories.statistics)
      applyConsent(existing)
      setView('hidden')
      setVisible(false)
    } else {
      applyConsent(createMinimalConsentState())
      setView('banner')
    }
    setHydrated(true)

    function onOpen() {
      const current = readStoredConsent()
      setExternal(current?.categories.external ?? false)
      setStatistics(current?.categories.statistics ?? false)
      setView('settings')
      requestAnimationFrame(() => setVisible(true))
    }

    function onFooterClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest?.('[data-rk-consent-open]')
      if (!target) return
      event.preventDefault()
      onOpen()
    }

    function onAcceptExternal(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest?.('[data-rk-consent-accept-external]')
      if (!target) return
      event.preventDefault()
      const state = createFullConsentState()
      writeConsent(state)
      applyConsent(state)
      setExternal(true)
      setStatistics(true)
      setVisible(false)
      setView('hidden')
    }

    function reapplyFromStore() {
      const current = readStoredConsent()
      if (current) applyConsent(current)
    }

    window.addEventListener(CONSENT_OPEN_EVENT, onOpen)
    window.addEventListener(CONSENT_CHANGED_EVENT, reapplyFromStore)
    document.addEventListener('rk:ready', reapplyFromStore)
    document.addEventListener('click', onFooterClick)
    document.addEventListener('click', onAcceptExternal)
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen)
      window.removeEventListener(CONSENT_CHANGED_EVENT, reapplyFromStore)
      document.removeEventListener('rk:ready', reapplyFromStore)
      document.removeEventListener('click', onFooterClick)
      document.removeEventListener('click', onAcceptExternal)
    }
  }, [])

  useEffect(() => {
    if (!hydrated || view === 'hidden') {
      setVisible(false)
      return
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(frame)
  }, [hydrated, view])

  function persist(nextExternal: boolean, nextStatistics: boolean) {
    const state: ConsentState = createConsentState({
      external: nextExternal,
      statistics: nextStatistics,
    })
    writeConsent(state)
    applyConsent(state)
    setExternal(nextExternal)
    setStatistics(nextStatistics)
    setVisible(false)
    window.setTimeout(() => setView('hidden'), 320)
  }

  if (!hydrated || view === 'hidden') return null

  return (
    <div
      className={`rk-consent${visible ? ' rk-consent--visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rk-consent-title"
    >
      <div className={`rk-consent-panel${view === 'settings' ? ' rk-consent-panel--settings' : ''}`}>
        <div className="rk-consent-inner">
          {view === 'banner' ? (
            <>
              <div className="rk-consent-copy">
                <p className="rk-consent-kicker">Cookies &amp; externe Inhalte</p>
                <h2 id="rk-consent-title" className="rk-consent-title">
                  Deine Wahl für rocketory.de
                </h2>
                <p className="rk-consent-text">
                  Wir nutzen technisch notwendige Cookies. Statistik (Matomo, self-hosted) und externe
                  Inhalte wie Google Maps laden wir erst nach deiner Einwilligung. Details in der{' '}
                  <a href="/datenschutz#cookies">Datenschutzerklärung</a>.
                </p>
              </div>
              <div className="rk-consent-actions">
                <button
                  type="button"
                  className="rk-consent-btn rk-consent-btn--primary"
                  onClick={() => persist(true, true)}
                >
                  Alle akzeptieren
                </button>
                <div className="rk-consent-btn-row">
                  <button
                    type="button"
                    className="rk-consent-btn rk-consent-btn--ghost"
                    onClick={() => persist(false, false)}
                  >
                    Nur notwendige
                  </button>
                  <button type="button" className="rk-consent-btn rk-consent-btn--ghost" onClick={() => setView('settings')}>
                    Einstellungen
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rk-consent-copy">
                <p className="rk-consent-kicker">Einstellungen</p>
                <h2 id="rk-consent-title" className="rk-consent-title">
                  Cookie-Einstellungen
                </h2>
                <p className="rk-consent-text">
                  Du kannst Statistik und externe Inhalte jederzeit erlauben oder ablehnen. Notwendig
                  bleibt immer aktiv.
                </p>
              </div>

              <div className="rk-consent-options">
                <label className="rk-consent-option">
                  <span className="rk-consent-option-copy">
                    <strong>Notwendig</strong>
                    <span>Erforderlich für Betrieb, Sicherheit und Speicherung deiner Auswahl.</span>
                  </span>
                  <input type="checkbox" checked disabled aria-label="Notwendige Cookies immer aktiv" />
                </label>

                <label className="rk-consent-option">
                  <span className="rk-consent-option-copy">
                    <strong>Statistik</strong>
                    <span>
                      Besucherstatistik mit self-hosted Matomo (First-Party, EU). Keine Daten an Google.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={statistics}
                    onChange={(event) => setStatistics(event.target.checked)}
                    aria-label="Statistik erlauben"
                  />
                </label>

                <label className="rk-consent-option">
                  <span className="rk-consent-option-copy">
                    <strong>Externe Inhalte</strong>
                    <span>Google Maps auf der Agenturseite. Beim Laden können Daten an Google gehen.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={external}
                    onChange={(event) => setExternal(event.target.checked)}
                    aria-label="Externe Inhalte erlauben"
                  />
                </label>
              </div>

              <div className="rk-consent-actions">
                <button
                  type="button"
                  className="rk-consent-btn rk-consent-btn--primary"
                  onClick={() => persist(external, statistics)}
                >
                  Auswahl speichern
                </button>
                <button type="button" className="rk-consent-btn rk-consent-btn--ghost" onClick={() => persist(false, false)}>
                  Ablehnen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
