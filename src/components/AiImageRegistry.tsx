import { getAiImageMatchers } from '@/lib/ai-images'

export async function AiImageRegistry() {
  const images = await getAiImageMatchers()

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__RK_AI_IMAGES=${JSON.stringify(images)};`,
      }}
    />
  )
}
