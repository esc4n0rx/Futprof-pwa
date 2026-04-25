export interface Bot {
  id: string
  name: string
  is_running: boolean
  created_at: string
  updated_at: string
}

export interface BotListResponse {
  bots: Bot[]
}

export interface CreateBotPayload {
  name: string
}

export interface CreateBotResponse {
  bot: Bot
}

export interface BotRuntimeMonitor {
  status: string
  last_cycle_at: string | null
  last_error: string | null
}

export interface BotWorkerMonitor {
  running: boolean
  stopRequested: boolean
}

export interface BotStatusResponse {
  bot: Pick<Bot, "id" | "name" | "is_running">
  monitor: {
    runtime: BotRuntimeMonitor
    worker: BotWorkerMonitor
  }
}

export interface BotLog {
  id: number
  level: string
  message: string
  payload: Record<string, unknown> | null
  created_at: string
}

export interface BotLogsResponse {
  logs: BotLog[]
}

export interface StartBotResponse {
  alreadyRunning: boolean
}
