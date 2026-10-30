import nodemailer from 'nodemailer'
import type { Payload } from 'payload'

import { SITE_URL } from '@/lib/metadata'
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
const LOGO_URL = `${SITE_URL}/assets/images/logo_1.png`
const CONTACT_URL = `${SITE_URL}/kontakt`
const BRAND = {
  ink: '#0A0F1E',
  cream: '#F5F4F0',
  white: '#FFFFFF',
  muted: '#5C6070',
  red: '#c1272d',
  orange: '#ff5c00',
  border: 'rgba(10,15,30,0.10)',
}

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\r\n?/g, '\n').replace(/\n/g, '<br>\n')
}

function normalizeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
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
    '',
    SITE_URL,
  )

  return lines.join('\n')
}

function sectionCard(label: string, bodyHtml: string): string {
  return `
                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:12px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.red};">
                            ${escapeHtml(label)}
                          </p>
                          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.55;color:${BRAND.ink};">
                            ${bodyHtml}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
}

export function buildKiCheckReportEmailHtml(input: KiCheckReportInput): string {
  const name = escapeHtml(input.recipientName)
  const websiteUrl = input.website ? normalizeHttpUrl(input.website) : null
  const websiteLabel = input.website ? escapeHtml(input.website) : ''
  const preheader = 'Dein persönlicher KI-Check-Analysebericht von Rocketory – Einschätzung, Kennzeichnung und nächste Schritte.'

  const websiteBlock = input.website
    ? `
                <tr>
                  <td style="padding:0 0 22px 0;">
                    <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">
                      Geprüfte Webseite
                    </p>
                    ${
                      websiteUrl
                        ? `<a href="${escapeHtml(websiteUrl)}" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${BRAND.ink};text-decoration:underline;">${websiteLabel}</a>`
                        : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${BRAND.ink};">${websiteLabel}</span>`
                    }
                  </td>
                </tr>`
    : ''

  const assessmentBlocks = [
    input.aiAssessment
      ? sectionCard('Einschätzung KI-Einsatz', nl2br(input.aiAssessment))
      : '',
    input.labelingAssessment
      ? sectionCard('Einschätzung Kennzeichnung', nl2br(input.labelingAssessment))
      : '',
    sectionCard('Unsere Empfehlungen', nl2br(input.reportBody)),
    input.nextStep ? sectionCard('Nächster Schritt', nl2br(input.nextStep)) : '',
  ].join('')

  const ctaPrimaryHref = websiteUrl || CONTACT_URL
  const ctaPrimaryLabel = websiteUrl ? 'Webseite öffnen' : 'Jetzt Kontakt aufnehmen'

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(input.subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};color:${BRAND.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
          <tr>
            <td style="background:${BRAND.ink};border-radius:16px 16px 0 0;padding:28px 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <a href="${SITE_URL}" style="text-decoration:none;">
                      <img src="${LOGO_URL}" width="168" height="39" alt="Rocketory" style="display:block;border:0;height:auto;max-width:168px;">
                    </a>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(245,244,240,0.72);">
                      KI-Check
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;color:#F5F4F0;">
                Dein Analysebericht
              </p>
              <p style="margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:rgba(245,244,240,0.68);">
                Persönliche Einschätzung zur EU-KI-Verordnung – klar, ehrlich, umsetzbar.
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;background:linear-gradient(90deg,${BRAND.red} 0%,${BRAND.orange} 100%);background-color:${BRAND.red};">
              &nbsp;
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND.cream};padding:28px 28px 8px 28px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 22px 0;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:${BRAND.ink};">
                      Hallo ${name},
                    </p>
                    <p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:${BRAND.ink};">
                      hier ist dein persönlicher KI-Check-Analysebericht von Rocketory.
                    </p>
                  </td>
                </tr>
                ${websiteBlock}
                ${assessmentBlocks}
                <tr>
                  <td style="padding:8px 0 8px 0;" align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius:8px;background:${BRAND.ink};">
                          <a href="${escapeHtml(ctaPrimaryHref)}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${BRAND.white};text-decoration:none;border-radius:8px;">
                            ${escapeHtml(ctaPrimaryLabel)}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:${BRAND.muted};">
                      Oder direkt schreiben:
                      <a href="mailto:beratung@rocketory.de" style="color:${BRAND.ink};font-weight:700;text-decoration:underline;">beratung@rocketory.de</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 0 8px 0;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:${BRAND.ink};">
                      Viele Grüße<br>
                      <strong>Dein Rocketory-Team</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND.ink};border-radius:0 0 16px 16px;padding:24px 28px;">
              <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#F5F4F0;">
                Rocketory
              </p>
              <p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:rgba(245,244,240,0.62);">
                FairFlock GmbH · Zimmerstr. 16 · 32257 Bünde<br>
                Webdesign mit Raketenantrieb aus OWL
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">
                <a href="${SITE_URL}" style="color:${BRAND.orange};text-decoration:none;font-weight:700;">rocketory.de</a>
                &nbsp;·&nbsp;
                <a href="${CONTACT_URL}" style="color:rgba(245,244,240,0.72);text-decoration:underline;">Kontakt</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 8px 0 8px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.45;color:${BRAND.muted};">
                Diese E-Mail wurde dir nach deiner KI-Check-Anfrage auf rocketory.de gesendet.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
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
      html: buildKiCheckReportEmailHtml(input),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter SMTP-Fehler'
    return { ok: false, error: `Versand fehlgeschlagen: ${message}` }
  }

  return { ok: true }
}
