import { getApiBaseUrl } from "@/lib/env"

const REQUEST_TIMEOUT_MS = 15000

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.toLowerCase().includes("application/json")) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function httpClient<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const baseUrl = getApiBaseUrl()

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: controller.signal,
    })

    const payload = await parseResponseBody(response)

    if (!response.ok) {
      const fallbackMessage = response.status >= 500 ? "Server error." : "Request failed."
      throw new ApiError(fallbackMessage, response.status, payload)
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    return payload as TResponse
  } finally {
    clearTimeout(timeout)
  }
}
