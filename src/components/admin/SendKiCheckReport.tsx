'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button, toast, useAllFormFields, useDocumentInfo, useFormFields } from '@payloadcms/ui'

import './send-ki-check-report.scss'

function fieldValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function extractWebsite(detailSummary: string, message: string): string {
  const haystack = `${detailSummary}\n${message}`
  const match = haystack.match(/https?:\/\/[^\s·]+/i)
  return match?.[0]?.replace(/[.,;)]+$/, '') || ''
}

export function SendKiCheckReport() {
  const { id } = useDocumentInfo()
  const [fields, dispatchFields] = useAllFormFields()
  const [sending, setSending] = useState(false)
  const [prefilled, setPrefilled] = useState(false)

  const replySentAt = useFormFields(([f]) => fieldValue(f.replySentAt?.value))
  const replySentTo = useFormFields(([f]) => fieldValue(f.replySentTo?.value))

  useEffect(() => {
    if (prefilled) return

    const email = fieldValue(fields.email?.value)
    const name = fieldValue(fields.name?.value)
    const detailSummary = fieldValue(fields.detailSummary?.value)
    const message = fieldValue(fields.message?.value)

    const updates: Array<{ path: string; value: string }> = []

    if (!fieldValue(fields.replyRecipientEmail?.value) && email) {
      updates.push({ path: 'replyRecipientEmail', value: email })
    }
    if (!fieldValue(fields.replyRecipientName?.value) && name) {
      updates.push({ path: 'replyRecipientName', value: name })
    }
    if (!fieldValue(fields.replySubject?.value)) {
      updates.push({
        path: 'replySubject',
        value: 'Dein KI-Check-Analysebericht – Rocketory',
      })
    }
    if (!fieldValue(fields.replyWebsite?.value)) {
      const website = extractWebsite(detailSummary, message)
      if (website) updates.push({ path: 'replyWebsite', value: website })
    }

    for (const update of updates) {
      dispatchFields({ type: 'UPDATE', path: update.path, value: update.value })
    }

    setPrefilled(true)
  }, [dispatchFields, fields, prefilled])

  const handleSend = useCallback(async () => {
    if (!id) {
      toast.error('Bitte die Anfrage zuerst speichern.')
      return
    }

    const payload = {
      recipientEmail: fieldValue(fields.replyRecipientEmail?.value),
      recipientName: fieldValue(fields.replyRecipientName?.value),
      subject: fieldValue(fields.replySubject?.value),
      website: fieldValue(fields.replyWebsite?.value),
      aiAssessment: fieldValue(fields.replyAiAssessment?.value),
      labelingAssessment: fieldValue(fields.replyLabelingAssessment?.value),
      reportBody: fieldValue(fields.replyReportBody?.value),
      nextStep: fieldValue(fields.replyNextStep?.value),
    }

    if (!payload.recipientEmail.includes('@')) {
      toast.error('Bitte eine gültige Empfänger-E-Mail eintragen.')
      return
    }
    if (!payload.recipientName.trim()) {
      toast.error('Bitte einen Namen für die Anrede eintragen.')
      return
    }
    if (!payload.reportBody.trim()) {
      toast.error('Bitte die Empfehlungen / den Bericht ausfüllen.')
      return
    }

    setSending(true)
    try {
      const res = await fetch(`/api/contact-inquiries/${id}/send-report`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        ok?: boolean
        replySentAt?: string
        replySentTo?: string
      }

      if (!res.ok) {
        toast.error(data.error || 'Versand fehlgeschlagen.')
        return
      }

      if (data.replySentAt) {
        dispatchFields({ type: 'UPDATE', path: 'replySentAt', value: data.replySentAt })
      }
      if (data.replySentTo) {
        dispatchFields({ type: 'UPDATE', path: 'replySentTo', value: data.replySentTo })
      }
      dispatchFields({ type: 'UPDATE', path: 'status', value: 'done' })

      toast.success(`Bericht gesendet an ${data.replySentTo || payload.recipientEmail}`)
    } catch {
      toast.error('Netzwerkfehler beim Versand.')
    } finally {
      setSending(false)
    }
  }, [dispatchFields, fields, id])

  const sentLabel = replySentAt
    ? `Zuletzt gesendet am ${new Date(replySentAt).toLocaleString('de-DE')}${
        replySentTo ? ` an ${replySentTo}` : ''
      }`
    : 'Noch kein Bericht versendet.'

  return (
    <div className="rk-send-ki-check-report">
      <p className="rk-send-ki-check-report__hint">
        Felder oben ausfüllen, dann Bericht per SMTP an die Empfänger-Adresse senden. Die Anfrage wird
        danach auf „Erledigt“ gesetzt.
      </p>
      <p className="rk-send-ki-check-report__status" role="status">
        {sentLabel}
      </p>
      <Button
        buttonStyle="primary"
        disabled={sending || !id}
        onClick={() => {
          void handleSend()
        }}
      >
        {sending ? 'Wird gesendet …' : 'Bericht senden'}
      </Button>
    </div>
  )
}
