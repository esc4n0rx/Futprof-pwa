import { httpClient } from "@/lib/services/http-client"
import type {
  BotListResponse,
  BotLogsResponse,
  BotStatusResponse,
  CreateBotPayload,
  CreateBotResponse,
  StartBotResponse,
} from "@/lib/types/bots"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const botsService = {
  list(accessToken: string): Promise<BotListResponse> {
    return httpClient<BotListResponse>("/api/bots", {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  create(accessToken: string, payload: CreateBotPayload): Promise<CreateBotResponse> {
    return httpClient<CreateBotResponse>("/api/bots", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  getStatus(accessToken: string, botId: string): Promise<BotStatusResponse> {
    return httpClient<BotStatusResponse>(`/api/bots/${botId}/status`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  start(accessToken: string, botId: string): Promise<StartBotResponse> {
    return httpClient<StartBotResponse>(`/api/bots/${botId}/start`, {
      method: "POST",
      headers: authHeaders(accessToken),
    })
  },

  pause(accessToken: string, botId: string): Promise<void> {
    return httpClient<void>(`/api/bots/${botId}/pause`, {
      method: "POST",
      headers: authHeaders(accessToken),
    })
  },

  getLogs(accessToken: string, botId: string, limit = 100): Promise<BotLogsResponse> {
    return httpClient<BotLogsResponse>(`/api/bots/${botId}/logs?limit=${limit}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },
}
