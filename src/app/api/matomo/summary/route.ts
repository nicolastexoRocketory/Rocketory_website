import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { fetchMatomoSummary, isMatomoConfigured, type MatomoPeriod } from '@/lib/matomo'
import { getPayloadClient } from '@/lib/payload'

export async function GET(request: Request) {
  const payload = await getPayloadClient()
  const headerList = await headers()
  const { user } = await payload.auth({ headers: headerList })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isMatomoConfigured()) {
    return NextResponse.json({ error: 'Matomo not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const period = (searchParams.get('period') || 'month') as MatomoPeriod
  const date = searchParams.get('date') || 'today'

  try {
    const summary = await fetchMatomoSummary(period, date)
    return NextResponse.json(summary)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Matomo API error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
