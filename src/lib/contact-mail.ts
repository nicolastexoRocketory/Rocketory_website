import nodemailer from 'nodemailer'
import type { Payload } from 'payload'

import type { ContactInquiry, EmailSetting } from '@/payload-types'

function buildAdminEmailBody(doc: ContactInquiry, settings?: EmailSetting): string {
  const lines = [
    'Neue Kontaktanfrage über rocketory.de',
    '',
    `Anliegen: ${doc.intentLabel || doc.intent || '–'}`,
    doc.detailSummary ? `Details: ${doc.detailSummary}` : '',
    `Name: ${doc.name}`,
    doc.company ? `Unternehmen: ${doc.company}` : '',
    `E-Mail: ${doc.email}`,
    doc.phone ? `Telefon: ${doc.phone}` : '',
    '',
    'Nachricht:',
    doc.message,
    doc.referral ? `Von uns erfahren über: ${doc.referral}` : '',
    '',
    '—',
    'Diese Anfrage wurde im Rocketory CMS gespeichert.',
  ].filter(Boolean)

  const footer = settings?.adminEmailFooter?.trim()
  if (footer) {
    lines.push('', footer)
  }

  return lines.join('\n')
}

function buildCustomerEmailBody(doc: ContactInquiry, settings?: EmailSetting): string {
  const custom = settings?.customerConfirmationBody?.trim()
  if (custom) {
    return custom
      .replace(/\{name\}/g, doc.name)
      .replace(/\{intent\}/g, doc.intentLabel || doc.intent || 'Kontaktanfrage')
  }

  return [
    `Hallo ${doc.name},`,
    '',
    'vielen Dank für deine Anfrage bei Rocketory. Wir haben deine Nachricht erhalten und melden uns in der Regel innerhalb von 24 Stunden.',
    '',
    'Dein Anliegen:',
    doc.intentLabel || doc.intent || 'Kontaktanfrage',
    '',
    'Bei Rückfragen erreichst du uns unter beratung@rocketory.de.',
    '',
    'Viele Grüße',
    'Dein Rocketory-Team',
  ].join('\n')
}

function parseEmailList(...values: Array<string | null | undefined>): string[] {
  const emails = new Set<string>()

  for (const value of values) {
    if (!value) continue
    for (const part of value.split(/[,;]+/)) {
      const email = part.trim()
      if (email.includes('@')) emails.add(email)
    }
  }

  return [...emails]
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

export async function sendContactInquiryNotification(
  payload: Payload,
  doc: ContactInquiry,
): Promise<void> {
  let settings: EmailSetting
  try {
    settings = await payload.findGlobal({ slug: 'email-settings' })
  } catch {
    return
  }

  if (!settings?.smtpEnabled || !settings.smtpHost) {
    return
  }

  const fromName = settings.fromName?.trim() || 'Rocketory Website'
  const fromEmail = settings.fromEmail?.trim()
  if (!fromEmail) return

  const transporter = createTransporter(settings)
  const prefix = settings.notificationSubjectPrefix?.trim() || 'Kontaktanfrage'
  const intentLabel = doc.intentLabel || doc.intent || 'Anfrage'
  const recipients = parseEmailList(settings.notificationEmail)
  const cc = parseEmailList(settings.notificationCc)
  const bcc = parseEmailList(settings.notificationBcc)

  if (recipients.length) {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipients.join(', '),
      replyTo: doc.email,
      subject: `${prefix}: ${intentLabel} – ${doc.name}`,
      text: buildAdminEmailBody(doc, settings),
      ...(cc.length ? { cc: cc.join(', ') } : {}),
      ...(bcc.length ? { bcc: bcc.join(', ') } : {}),
    })
  }

  if (settings.sendCustomerConfirmation && doc.email) {
    const confirmationSubject =
      settings.customerConfirmationSubject?.trim() || 'Deine Anfrage bei Rocketory'

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: doc.email,
      replyTo: settings.replyToEmail?.trim() || fromEmail,
      subject: confirmationSubject,
      text: buildCustomerEmailBody(doc, settings),
    })
  }
}
