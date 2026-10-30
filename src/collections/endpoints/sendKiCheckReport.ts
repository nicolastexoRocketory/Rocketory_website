import type { Endpoint } from 'payload'

import {
  normalizeKiCheckReportInput,
  sendKiCheckReportMail,
} from '@/lib/ki-check-report-mail'
import type { ContactInquiry } from '@/payload-types'

export const sendKiCheckReportEndpoint: Endpoint = {
  path: '/:id/send-report',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Nicht angemeldet.' }, { status: 401 })
    }

    const id = req.routeParams?.id
    if (id === undefined || id === null || id === '') {
      return Response.json({ error: 'Anfrage-ID fehlt.' }, { status: 400 })
    }

    let body: Record<string, unknown> = {}
    try {
      body = (await req.json?.()) as Record<string, unknown>
    } catch {
      return Response.json({ error: 'Ungültiger Request-Body.' }, { status: 400 })
    }

    const normalized = normalizeKiCheckReportInput(body)
    if ('error' in normalized) {
      return Response.json({ error: normalized.error }, { status: 400 })
    }

    let inquiry: ContactInquiry
    try {
      inquiry = (await req.payload.findByID({
        collection: 'contact-inquiries',
        id: String(id),
        depth: 0,
        req,
      })) as ContactInquiry
    } catch {
      return Response.json({ error: 'Kontaktanfrage nicht gefunden.' }, { status: 404 })
    }

    const result = await sendKiCheckReportMail(req.payload, normalized)
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 })
    }

    const sentAt = new Date().toISOString()

    try {
      await req.payload.update({
        collection: 'contact-inquiries',
        id: String(id),
        data: {
          replyRecipientEmail: normalized.recipientEmail,
          replyRecipientName: normalized.recipientName,
          replySubject: normalized.subject,
          replyWebsite: normalized.website || '',
          replyAiAssessment: normalized.aiAssessment || '',
          replyLabelingAssessment: normalized.labelingAssessment || '',
          replyReportBody: normalized.reportBody,
          replyNextStep: normalized.nextStep || '',
          replySentAt: sentAt,
          replySentTo: normalized.recipientEmail,
          status: inquiry.status === 'spam' ? inquiry.status : 'done',
        },
        req,
        depth: 0,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Speichern fehlgeschlagen'
      return Response.json(
        {
          error: `Mail wurde gesendet, aber Speichern fehlgeschlagen: ${message}`,
          sent: true,
          replySentAt: sentAt,
          replySentTo: normalized.recipientEmail,
        },
        { status: 500 },
      )
    }

    return Response.json({
      ok: true,
      replySentAt: sentAt,
      replySentTo: normalized.recipientEmail,
    })
  },
}
