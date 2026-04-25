import { httpClient } from "@/lib/services/http-client"
import type { CartResponse } from "@/lib/types/cart"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const cartService = {
  getRealtime(accessToken: string, botId: string): Promise<CartResponse> {
    const query = new URLSearchParams({ botId, realtime: "true" })
    return httpClient<CartResponse>(`/api/cart?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },
}
