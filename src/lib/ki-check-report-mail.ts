import nodemailer from 'nodemailer'
import type { Payload } from 'payload'

import { toPlainText, toPlainTextMultiline } from '@/lib/sanitize'
import type { EmailSetting } from '@/payload-types'

export type KiCheckReportInput = {
  recipientEmail: string
  recipientName: string
  subject: string
  website?: string
  aiAssessment?: string
  labelingAssessment?: string
  reportBody: string
  nextStep?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeKiCheckReportInput(raw: Record<string, unknown>): KiCheckReportInput | { error: string } {
  const recipientEmail = toPlainText(String(raw.recipientEmail ?? '')).slice(0, 320)
  const recipientName = toPlainText(String(raw.recipientName ?? '')).slice(0, 200)
  const subject =
    toPlainText(String(raw.subject ?? '')).slice(0, 200) ||
    'Dein KI-Check-Analysebericht – Rocketory'
  const website = toPlainText(String(raw.website ?? '')).slice(0, 500)
  const aiAssessment = toPlainTextMultiline(String(raw.aiAssessment ?? '')).slice(0, 4000)
  const labelingAssessment = toPlainTextMultiline(String(raw.labelingAssessment ?? '')).slice(0, 4000)
  const reportBody = toPlainTextMultiline(String(raw.reportBody ?? '')).slice(0, 12000)
  const nextStep = toPlainTextMultiline(String(raw.nextStep ?? '')).slice(0, 4000)

  if (!recipientEmail || !EMAIL_RE.test(recipientEmail)) {
    return { error: 'Bitte eine gültige Empfänger-E-Mail eintragen.' }
  }
  if (!recipientName) {
    return { error: 'Bitte einen Namen für die Anrede eintragen.' }
  }
  if (!reportBody.trim()) {
    return { error: 'Bitte die Empfehlungen / den Bericht ausfüllen.' }
  }

  return {
    recipientEmail,
    recipientName,
    subject,
    website: website || undefined,
    aiAssessment: aiAssessment || undefined,
    labelingAssessment: labelingAssessment || undefined,
    reportBody,
    nextStep: nextStep || undefined,
  }
}

export function buildKiCheckReportEmailBody(input: KiCheckReportInput): string {
  const lines = [
    `Hallo ${input.recipientName},`,
    '',
    'hier ist dein persönlicher KI-Check-Analysebericht von Rocketory.',
    '',
  ]

  if (input.website) {
    lines.push(`Webseite: ${input.website}`, '')
  }

  if (input.aiAssessment) {
    lines.push('Einschätzung KI-Einsatz:', input.aiAssessment, '')
  }

  if (input.labelingAssessment) {
    lines.push('Einschätzung Kennzeichnung:', input.labelingAssessment, '')
  }

  lines.push('Unsere Empfehlungen:', input.reportBody, '')

  if (input.nextStep) {
    lines.push('Nächster Schritt:', input.nextStep, '')
  }

  lines.push(
    'Bei Rückfragen erreichst du uns unter beratung@rocketory.de.',
    '',
    'Viele Grüße',
    'Dein Rocketory-Team',
  )

  return lines.join('\n')
}

function createTransporter(settings: EmailSetting) {
  const port = settings.smtpPort ?? 587
  const secure = settings.smtpSecure === 'ssl'

  return nodemailer.createTransport({
    host: settings.smtpHost || undefined,
    port,
    secure,
    auth:
      settings.smtpUser && settings.smtpPassword
        ? {
            user: settings.smtpUser,
            pass: settings.smtpPassword,
          }
        : undefined,
    requireTLS: settings.smtpSecure === 'starttls',
    tls: settings.smtpSecure === 'none' ? { rejectUnauthorized: false } : undefined,
  })
}

export async function sendKiCheckReportMail(
  payload: Payload,
  input: KiCheckReportInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  let settings: EmailSetting
  try {
    settings = await payload.findGlobal({ slug: 'email-settings' })
  } catch {
    return { ok: false, error: 'E-Mail-Einstellungen konnten nicht geladen werden.' }
  }

  if (!settings?.smtpEnabled || !settings.smtpHost) {
    return {
      ok: false,
      error: 'SMTP ist nicht aktiv. Unter „E-Mail & SMTP“ den Versand aktivieren.',
    }
  }

  const fromName = settings.fromName?.trim() || 'Rocketory Webseite'
  const fromEmail = settings.fromEmail?.trim()
  if (!fromEmail) {
    return { ok: false, error: 'Absender-E-Mail fehlt in den E-Mail-Einstellungen.' }
  }

  const transporter = createTransporter(settings)

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: input.recipientEmail,
      replyTo: settings.replyToEmail?.trim() || fromEmail,
      subject: input.subject,
      text: buildKiCheckReportEmailBody(input),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter SMTP-Fehler'
    return { ok: false, error: `Versand fehlgeschlagen: ${message}` }
  }

  return { ok: true }
}
