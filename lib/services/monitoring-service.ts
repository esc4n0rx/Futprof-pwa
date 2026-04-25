import { httpClient } from "@/lib/services/http-client"
import type {
  MonitorEventsResponse,
  MonitorNotificationsResponse,
  MonitorRefreshResponse,
  MonitorScopePayload,
  MonitorSectorScopePayload,
  MonitorSectorsResponse,
  MonitorStartResponse,
  MonitorStatusResponse,
} from "@/lib/types/monitoring"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const monitoringService = {
  start(accessToken: string, botId: string): Promise<MonitorStartResponse> {
    return httpClient<MonitorStartResponse>("/api/monitor/start", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ botId }),
    })
  },

  stop(accessToken: string, botId: string): Promise<void> {
    return httpClient<void>("/api/monitor/stop", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ botId }),
    })
  },

  status(accessToken: string, botId: string): Promise<MonitorStatusResponse> {
    const query = new URLSearchParams({ botId })
    return httpClient<MonitorStatusResponse>(`/api/monitor/status?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  refresh(accessToken: string, botId: string): Promise<MonitorRefreshResponse> {
    return httpClient<MonitorRefreshResponse>("/api/monitor/refresh", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ botId }),
    })
  },

  events(accessToken: string, botId: string): Promise<MonitorEventsResponse> {
    const query = new URLSearchParams({ botId })
    return httpClient<MonitorEventsResponse>(`/api/monitor/events?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  sectors(accessToken: string, botId: string): Promise<MonitorSectorsResponse> {
    const query = new URLSearchParams({ botId })
    return httpClient<MonitorSectorsResponse>(`/api/monitor/sectors?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  notifications(accessToken: string, botId: string, limit = 100): Promise<MonitorNotificationsResponse> {
    const query = new URLSearchParams({ botId, limit: String(limit) })
    return httpClient<MonitorNotificationsResponse>(`/api/monitor/notifications?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  scopeMonitor(accessToken: string, payload: MonitorScopePayload): Promise<void> {
    return httpClient<void>("/api/monitor/scope/monitor", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  scopePurchase(accessToken: string, payload: MonitorScopePayload): Promise<void> {
    return httpClient<void>("/api/monitor/scope/purchase", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  scopeNotifications(accessToken: string, payload: MonitorScopePayload): Promise<void> {
    return httpClient<void>("/api/monitor/scope/notifications", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  scopeSectors(accessToken: string, payload: MonitorSectorScopePayload): Promise<void> {
    return httpClient<void>("/api/monitor/scope/sectors", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },
}
