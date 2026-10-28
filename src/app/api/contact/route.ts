import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { getTurnstileConfig, resolveFormKind, verifyTurnstileToken } from '@/lib/turnstile'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ContactPayload = {
  intent?: string
  intentLabel?: string
  detailSummary?: string
  message?: string
  name?: string
  company?: string
  email?: string
  phone?: string
  referral?: string
  projectBrief?: string
  projectPages?: string
  projectTimeline?: string
  festpreisPaket?: string
  festpreisTech?: string
  seoLaufzeit?: string
  redesignTyp?: string
  budget?: string
  turnstileToken?: string
}

function clean(value: unknown, maxLength = 5000): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

export async function POST(request: Request) {
  let body: ContactPayload

  try {
    body = (await request.json()) as ContactPayload
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const name = clean(body.name, 200)
  const email = clean(body.email, 320)
  const message = clean(body.message, 8000)

  if (!name) {
    return NextResponse.json({ error: 'Bitte gib deinen Namen ein.' }, { status: 400 })
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ error: 'Bitte beschreibe kurz dein Anliegen.' }, { status: 400 })
  }

  const intent = clean(body.intent, 80)
  const intentLabel = clean(body.intentLabel, 200) || intent
  const formKind = resolveFormKind(intent)
  const remoteIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''

  try {
    const payload = await getPayloadClient()

    let settings
    try {
      settings = await payload.findGlobal({ slug: 'email-settings' })
    } catch {
      settings = null
    }

    const turnstile = getTurnstileConfig(settings, formKind)
    if (turnstile.enabled) {
      const result = await verifyTurnstileToken(
        turnstile.secretKey,
        clean(body.turnstileToken, 2048),
        remoteIp,
      )
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    await payload.create({
      collection: 'contact-inquiries',
      overrideAccess: true,
      data: {
        status: 'new',
        source: 'website',
        intent,
        intentLabel,
        detailSummary: clean(body.detailSummary, 2000),
        message,
        name,
        company: clean(body.company, 200),
        email,
        phone: clean(body.phone, 80),
        referral: clean(body.referral, 200),
        projectBrief: clean(body.projectBrief, 4000),
        projectPages: clean(body.projectPages, 120),
        projectTimeline: clean(body.projectTimeline, 120),
        festpreisPaket: clean(body.festpreisPaket, 80),
        festpreisTech: clean(body.festpreisTech, 80),
        seoLaufzeit: clean(body.seoLaufzeit, 80),
        redesignTyp: clean(body.redesignTyp, 80),
        budget: clean(body.budget, 80),
        ipAddress: remoteIp,
        userAgent: clean(request.headers.get('user-agent') || '', 500),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Failed to save inquiry:', error)
    return NextResponse.json(
      { error: 'Senden fehlgeschlagen. Bitte versuche es später erneut.' },
      { status: 500 },
    )
  }
}
