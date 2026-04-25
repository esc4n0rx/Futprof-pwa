export interface MonitorRuntimeStatus {
  status: string
  last_cycle_at: string | null
  last_error: string | null
}

export interface MonitorWorkerStatus {
  running: boolean
  stopRequested: boolean
}

export interface MonitorStatusResponse {
  runtime: MonitorRuntimeStatus
  worker: MonitorWorkerStatus
}

export interface MonitorStartResponse {
  alreadyRunning: boolean
}

export interface MonitorRefreshResponse {
  ok: boolean
}

export interface MonitorEvent {
  index: number
  eventId: string
  name: string
  href: string
  monitored: boolean
  purchaseEnabled: boolean
  notificationsEnabled: boolean
  updatedAt: string
}

export interface MonitorEventsResponse {
  events: MonitorEvent[]
}

export interface MonitorSector {
  sectorId: string
  name: string
  price: string
  available: boolean
  updatedAt: string
}

export interface MonitorSectorSession {
  eventId: string
  eventName: string
  sectors: MonitorSector[]
}

export interface MonitorSectorsResponse {
  sessions: MonitorSectorSession[]
}

export interface MonitorNotificationPurchaseAttempt {
  endpoint: string
  success: boolean
  httpStatus: number | null
  responseStatus: number | null
  message: string | null
  error: string | null
  retryAfterSeconds: number | null
  responsePreview: unknown
}

export interface MonitorNotificationPurchaseFailure {
  accountId: string
  accountName: string
  reason: string
  attempts?: MonitorNotificationPurchaseAttempt[]
}

export interface MonitorNotificationPayload {
  eventName?: string
  sectorName?: string
  price?: string
  reason?: string
  failures?: MonitorNotificationPurchaseFailure[]
  [key: string]: unknown
}

export interface MonitorNotification {
  id: number
  type: string
  event_id: string
  payload: MonitorNotificationPayload | null
  created_at: string
}

export interface MonitorNotificationsResponse {
  notifications: MonitorNotification[]
}

export type MonitorScopeMode = "all" | "event"

export interface MonitorScopePayload {
  botId: string
  mode: MonitorScopeMode
  eventId?: string
}

export type MonitorSectorScopeMode = "all" | "specific" | "add" | "remove"

export interface MonitorSectorSelection {
  eventId: string
  sectorId: string
}

export interface MonitorSectorScopePayload {
  botId: string
  mode: MonitorSectorScopeMode
  selections: MonitorSectorSelection[]
}
