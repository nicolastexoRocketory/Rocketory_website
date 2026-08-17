import { NextResponse } from 'next/server'

import { getAiImageMatchers } from '@/lib/ai-images'

export async function GET() {
  const images = await getAiImageMatchers()

  return NextResponse.json(
    { images },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
