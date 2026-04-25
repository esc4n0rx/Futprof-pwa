const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

const normalizedApiBaseUrl = rawApiBaseUrl.trim().replace(/\/+$/, "")

export const env = {
  apiBaseUrl: normalizedApiBaseUrl,
}

export function getApiBaseUrl(): string {
  if (!env.apiBaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL")
  }

  return env.apiBaseUrl
}
