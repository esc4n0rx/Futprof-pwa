export interface PushConfig {
  provider: "onesignal" | string
  enabled: boolean
  appId: string | null
  externalUserId: string | null
}

export interface PushConfigResponse {
  push: PushConfig
}

export interface PushTestPayload {
  title?: string
  body?: string
  url?: string
}

export interface PushTestResponse {
  sent: boolean
  id?: string
  reason?: string
}
