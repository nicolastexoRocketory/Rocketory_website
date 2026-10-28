import type { EmailSetting } from '@/payload-types'

export type FormKind = 'kontakt' | 'ki-check'

type TurnstileConfig = {
  enabled: boolean
  siteKey: string
  secretKey: string
}

export function resolveFormKind(intent: string | null | undefined): FormKind {
  return intent === 'ki-check' ? 'ki-check' : 'kontakt'
}

export function getTurnstileConfig(
  settings: EmailSetting | null | undefined,
  form: FormKind,
): TurnstileConfig {
  const enabledFlag =
    form === 'ki-check' ? settings?.kiCheckTurnstileEnabled : settings?.kontaktTurnstileEnabled
  const siteKey = (
    form === 'ki-check' ? settings?.kiCheckTurnstileSiteKey : settings?.kontaktTurnstileSiteKey
  )?.trim()
  const secretKey = (
    form === 'ki-check' ? settings?.kiCheckTurnstileSecretKey : settings?.kontaktTurnstileSecretKey
  )?.trim()

  const hasKeys = Boolean(siteKey && secretKey)
  // Enabled only when checkbox is not explicitly off AND both keys are set
  const enabled = enabledFlag !== false && hasKeys

  return {
    enabled,
    siteKey: siteKey || '',
    secretKey: secretKey || '',
  }
}

type SiteVerifyResponse = {
  success?: boolean
  'error-codes'?: string[]
}

export async function verifyTurnstileToken(
  secretKey: string,
  token: string,
  remoteIp?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!token.trim()) {
    return { ok: false, error: 'Bitte bestätige die Sicherheitsprüfung.' }
  }

  const body = new URLSearchParams()
  body.set('secret', secretKey)
  body.set('response', token)
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!res.ok) {
      return { ok: false, error: 'Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut.' }
    }

    const data = (await res.json()) as SiteVerifyResponse
    if (data.success) return { ok: true }

    return { ok: false, error: 'Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut.' }
  } catch {
    return { ok: false, error: 'Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut.' }
  }
}
