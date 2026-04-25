import { httpClient } from "@/lib/services/http-client"
import type {
  CreateAccountPayload,
  CreateAccountResponse,
  ListAccountsResponse,
  SetActivePayload,
  SetPrimaryPayload,
  UpdateAccountPayload,
} from "@/lib/types/accounts"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const accountsService = {
  list(accessToken: string, botId: string): Promise<ListAccountsResponse> {
    const query = new URLSearchParams({ botId })
    return httpClient<ListAccountsResponse>(`/api/accounts?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  create(accessToken: string, payload: CreateAccountPayload): Promise<CreateAccountResponse> {
    return httpClient<CreateAccountResponse>("/api/accounts", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  update(accessToken: string, accountId: string, payload: UpdateAccountPayload): Promise<void> {
    return httpClient<void>(`/api/accounts/${accountId}`, {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  remove(accessToken: string, accountId: string, botId: string): Promise<void> {
    const query = new URLSearchParams({ botId })
    return httpClient<void>(`/api/accounts/${accountId}?${query.toString()}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    })
  },

  setPrimary(accessToken: string, payload: SetPrimaryPayload): Promise<void> {
    return httpClient<void>("/api/accounts/primary", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  setActive(accessToken: string, payload: SetActivePayload): Promise<void> {
    return httpClient<void>("/api/accounts/active", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  resetBot(accessToken: string, botId: string): Promise<void> {
    const query = new URLSearchParams({ botId })
    return httpClient<void>(`/api/accounts/reset-bot?${query.toString()}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    })
  },
}
