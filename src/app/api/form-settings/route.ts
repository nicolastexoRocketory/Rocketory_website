import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { getTurnstileConfig } from '@/lib/turnstile'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'email-settings' })

    const kontakt = getTurnstileConfig(settings, 'kontakt')
    const kiCheck = getTurnstileConfig(settings, 'ki-check')

    return NextResponse.json({
      kontakt: {
        siteKey: kontakt.enabled ? kontakt.siteKey : '',
        enabled: kontakt.enabled,
      },
      kiCheck: {
        siteKey: kiCheck.enabled ? kiCheck.siteKey : '',
        enabled: kiCheck.enabled,
      },
    })
  } catch (error) {
    console.error('[form-settings] Failed to load settings:', error)
    return NextResponse.json(
      {
        kontakt: { siteKey: '', enabled: false },
        kiCheck: { siteKey: '', enabled: false },
      },
      { status: 200 },
    )
  }
}
