export interface CartHold {
  sectorName: string
  price: string
  remainingSeconds: number
}

export interface CartTicketByAccount {
  accountId: string
  accountName: string
  count: number
  remainingSeconds: number
}

export interface CartEvent {
  eventId: string
  eventName: string
  hold: CartHold
  tickets: CartTicketByAccount[]
}

export interface CartResponse {
  hasLocalData: boolean
  totalTickets: number
  divergences: string[]
  events: CartEvent[]
  cartUrl: string | null
}
