import { httpClient } from "@/lib/services/http-client"
import type {
  PurchaseAttemptPayload,
  PurchaseAttemptResponse,
  PurchaseTargetsResponse,
  TogglePurchaseTargetPayload,
} from "@/lib/types/purchase"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const purchaseService = {
  getTargets(accessToken: string, botId: string): Promise<PurchaseTargetsResponse> {
    const query = new URLSearchParams({ botId })
    return httpClient<PurchaseTargetsResponse>(`/api/purchase/targets?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  toggleTarget(accessToken: string, payload: TogglePurchaseTargetPayload): Promise<void> {
    return httpClient<void>("/api/purchase/targets/toggle", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  enableAllTargets(accessToken: string, botId: string): Promise<void> {
    return httpClient<void>("/api/purchase/targets/all", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ botId }),
    })
  },

  attemptPurchase(accessToken: string, payload: PurchaseAttemptPayload): Promise<PurchaseAttemptResponse> {
    return httpClient<PurchaseAttemptResponse>("/api/purchase/attempt", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },
}
