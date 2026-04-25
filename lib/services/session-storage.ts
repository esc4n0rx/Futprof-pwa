import type { AuthTokens } from "@/lib/types/auth"

const SESSION_STORAGE_KEY = "futprof.auth.session"

function hasWindow(): boolean {
  return typeof window !== "undefined"
}

export function saveSession(tokens: AuthTokens): void {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(tokens))
}

export function loadSession(): AuthTokens | null {
  if (!hasWindow()) {
    return null
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<AuthTokens>
    if (!parsed.accessToken || !parsed.refreshToken) {
      return null
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    }
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (!hasWindow()) {
    return
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}
