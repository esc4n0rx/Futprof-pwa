import { httpClient } from "@/lib/services/http-client"
import type { PushConfigResponse, PushTestPayload, PushTestResponse } from "@/lib/types/push"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const pushService = {
  config(accessToken: string): Promise<PushConfigResponse> {
    return httpClient<PushConfigResponse>("/api/push/config", {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  test(accessToken: string, payload?: PushTestPayload): Promise<PushTestResponse> {
    return httpClient<PushTestResponse>("/api/push/test", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload ?? {}),
    })
  },
}
