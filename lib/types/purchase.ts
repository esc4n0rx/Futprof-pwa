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

export interface PurchaseAttemptResponse {
  success: boolean
  accountName: string
  ticketCount: number
  maxTicketsPerAccount: number
  cartUrl: string
}
