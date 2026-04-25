import { httpClient } from "@/lib/services/http-client"
import type { ActivateLicensePayload, ActivateLicenseResponse, LicenseCheckResponse } from "@/lib/types/licenses"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const licensesService = {
  check(accessToken: string): Promise<LicenseCheckResponse> {
    return httpClient<LicenseCheckResponse>("/api/licenses/check", {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  activate(accessToken: string, payload: ActivateLicensePayload): Promise<ActivateLicenseResponse> {
    return httpClient<ActivateLicenseResponse>("/api/licenses/activate", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },
}
