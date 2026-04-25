import { httpClient } from "@/lib/services/http-client"
import type {
  CreateAutomationAccountPayload,
  CreateAutomationAccountResponse,
} from "@/lib/types/accounts"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const accountCreationService = {
  create(accessToken: string, payload: CreateAutomationAccountPayload): Promise<CreateAutomationAccountResponse> {
    return httpClient<CreateAutomationAccountResponse>("/api/create-account", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },
}
