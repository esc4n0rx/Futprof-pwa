"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Activity, Bot, CalendarDays, Clock, RefreshCw, ShieldAlert, Bell } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { botsService } from "@/lib/services/bots-service"
import { monitoringService } from "@/lib/services/monitoring-service"
import type { Bot as BotType } from "@/lib/types/bots"
import type { MonitorEvent, MonitorNotification, MonitorStatusResponse } from "@/lib/types/monitoring"
import { cn } from "@/lib/utils"

function formatDateTime(input: string | null | undefined): string {
  if (!input) {
    return "-"
  }

  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    return input
  }

  return parsed.toLocaleString("pt-BR")
}

function notificationMessage(item: MonitorNotification): string {
  const eventId = item.event_id ? ` (evento ${item.event_id})` : ""
  return `${item.type}${eventId}`
}

export function HomeScreen() {
  const { user, withAuth, selectedBotId, setSelectedBotId } = useApp()

  const [bots, setBots] = useState<BotType[]>([])
  const [loadingBots, setLoadingBots] = useState(true)

  const [monitorStatus, setMonitorStatus] = useState<MonitorStatusResponse | null>(null)
  const [monitorEvents, setMonitorEvents] = useState<MonitorEvent[]>([])
  const [monitorNotifications, setMonitorNotifications] = useState<MonitorNotification[]>([])
  const [loadingMonitoring, setLoadingMonitoring] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  const activeBots = useMemo(() => bots.filter((bot) => bot.is_running), [bots])
  const pausedBots = Math.max(0, bots.length - activeBots.length)

  const activeMonitorBotId = useMemo(() => {
    if (selectedBotId && activeBots.some((bot) => bot.id === selectedBotId)) {
      return selectedBotId
    }

    return activeBots[0]?.id ?? null
  }, [activeBots, selectedBotId])

  const activeMonitorBot = useMemo(
    () => activeBots.find((bot) => bot.id === activeMonitorBotId) ?? null,
    [activeBots, activeMonitorBotId],
  )

  const loadBots = useCallback(async () => {
    setLoadingBots(true)
    try {
      const response = await withAuth((token) => botsService.list(token))
      setBots(response.bots)

      const active = response.bots.filter((bot) => bot.is_running)
      if (active.length > 0 && (!selectedBotId || !active.some((bot) => bot.id === selectedBotId))) {
        setSelectedBotId(active[0].id)
      }
    } finally {
      setLoadingBots(false)
    }
  }, [selectedBotId, setSelectedBotId, withAuth])

  const loadMonitoring = useCallback(
    async (botId: string) => {
      setLoadingMonitoring(true)
      try {
        const result = await withAuth(async (token) => {
          const [status, events, notifications] = await Promise.all([
            monitoringService.status(token, botId),
            monitoringService.events(token, botId),
            monitoringService.notifications(token, botId, 25),
          ])
          return { status, events, notifications }
        })

        setMonitorStatus(result.status)
        setMonitorEvents(result.events.events)
        setMonitorNotifications(result.notifications.notifications)
      } catch {
        setMonitorStatus(null)
        setMonitorEvents([])
        setMonitorNotifications([])
      } finally {
        setLoadingMonitoring(false)
      }
    },
    [withAuth],
  )

  useEffect(() => {
    void loadBots()
  }, [loadBots])

  useEffect(() => {
    if (!activeMonitorBotId) {
      setMonitorStatus(null)
      setMonitorEvents([])
      setMonitorNotifications([])
      return
    }

    void loadMonitoring(activeMonitorBotId)
  }, [activeMonitorBotId, loadMonitoring])

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-black text-foreground tracking-tight text-balance">{user?.name ?? "Usuario"}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn("w-2 h-2 rounded-full", activeBots.length > 0 ? "bg-green-400 pulse" : "bg-yellow-400")} />
            <span className="text-xs text-muted-foreground">
              {activeBots.length > 0 ? "Monitoramento ativo" : "Sem bot ativo para monitoramento"}
            </span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">{user?.avatar}</span>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Visao Geral</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-green-400/10">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black text-foreground">{activeBots.length}</div>
              <div className="text-[10px] text-muted-foreground">Bots Ativos</div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-yellow-400/10">
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black text-foreground">{pausedBots}</div>
              <div className="text-[10px] text-muted-foreground">Bots Pausados</div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-400/10">
              <CalendarDays className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black text-foreground">{monitorEvents.length}</div>
              <div className="text-[10px] text-muted-foreground">Eventos Monitorados</div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black text-foreground">{monitorNotifications.length}</div>
              <div className="text-[10px] text-muted-foreground">Notificacoes Recentes</div>
            </div>
          </div>
        </div>
      </div>

      {activeBots.length === 0 && (
        <div className="glass rounded-2xl p-4 border border-yellow-400/25">
          <p className="text-sm font-semibold text-yellow-300">Monitoramento indisponivel</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ative ao menos 1 bot na tela de bots para habilitar monitoramento na Home e no Carrinho.
          </p>
        </div>
      )}

      {activeMonitorBot && (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status do Monitor</h2>
              <button
                onClick={() => {
                  if (activeMonitorBotId) {
                    void loadMonitoring(activeMonitorBotId)
                  }
                }}
                className="text-xs text-primary font-medium flex items-center gap-1"
                disabled={loadingMonitoring}
              >
                <RefreshCw className={cn("w-3 h-3", loadingMonitoring && "animate-spin")} /> Atualizar
              </button>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bot monitorado</p>
                  <p className="text-sm font-semibold text-foreground">{activeMonitorBot.name}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  monitorStatus?.worker.running ? "text-green-400 bg-green-400/10" : "text-yellow-300 bg-yellow-500/10",
                )}>
                  {monitorStatus?.runtime.status ?? "unknown"}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" /> Ultimo ciclo: {formatDateTime(monitorStatus?.runtime.last_cycle_at)}
              </div>

              {monitorStatus?.runtime.last_error && (
                <div className="mt-2 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-2">
                  Ultimo erro: {monitorStatus.runtime.last_error}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Eventos Monitorados</h2>
            <div className="flex flex-col gap-2.5">
              {monitorEvents.length === 0 && (
                <div className="glass rounded-2xl p-4 text-xs text-muted-foreground">Nenhum evento monitorado neste bot.</div>
              )}

              {monitorEvents.map((eventItem) => (
                <div key={eventItem.eventId} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{eventItem.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">eventId: {eventItem.eventId}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full", eventItem.monitored ? "bg-green-400/10 text-green-300" : "bg-secondary text-muted-foreground")}>Monit.</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground">Atualizado em {formatDateTime(eventItem.updatedAt)}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Atividade Recente</h2>
            <div className="glass rounded-2xl divide-y divide-border/40">
              {monitorNotifications.length === 0 && (
                <div className="p-3.5 text-xs text-muted-foreground">Sem notificacoes recentes.</div>
              )}

              {monitorNotifications.slice(0, 12).map((item, index) => (
                <div key={item.id} className={cn("flex items-start gap-3 p-3.5", index === 0 && "rounded-t-2xl", index === 11 && "rounded-b-2xl")}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-blue-300 bg-blue-500/10">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">{notificationMessage(item)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{formatDateTime(item.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
