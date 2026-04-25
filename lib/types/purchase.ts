export interface PurchaseTarget {
  eventId: string
  name: string
  enabled: boolean
}

export interface PurchaseTargetsResponse {
  targets: PurchaseTarget[]
}

export interface TogglePurchaseTargetPayload {
  botId: string
  eventId: string
}

export interface PurchaseAttemptPayload {
  botId: string
  eventId: string
  sectorId: string
  sectorName: string
  price: string
}

export interface PurchaseEndpointAttempt {
  endpoint: string
  success: boolean
  httpStatus: number | null
  responseStatus: number | null
  message: string | null
  error: string | null
  retryAfterSeconds: number | null
  responsePreview: unknown
}

export interface PurchaseAccountFailure {
  accountId: string
  accountName: string
  reason: string
  attempts?: PurchaseEndpointAttempt[]
}

export interface PurchaseAttemptSuccessResponse {
  success: true
  accountName: string
  ticketCount: number
  maxTicketsPerAccount: number
  cartUrl: string
  attempts: PurchaseEndpointAttempt[]
}

export interface PurchaseAttemptFailureResponse {
  success: false
  failures: PurchaseAccountFailure[]
}

export type PurchaseAttemptResponse = PurchaseAttemptSuccessResponse | PurchaseAttemptFailureResponse
