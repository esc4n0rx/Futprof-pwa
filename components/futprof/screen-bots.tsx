"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Plus,
  Search,
  ChevronRight,
  Bot,
  Play,
  Pause,
  X,
  ArrowLeft,
  Terminal,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { botsService } from "@/lib/services/bots-service"
import type { Bot as ApiBot, BotLog, BotStatusResponse } from "@/lib/types/bots"
import { cn } from "@/lib/utils"

type BotStatusFilter = "all" | "active" | "paused" | "error"

const statusConfig: Record<Exclude<BotStatusFilter, "all">, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: "Ativo", color: "text-green-400", bg: "bg-green-400/10", dot: "bg-green-400" },
  paused: { label: "Pausado", color: "text-yellow-400", bg: "bg-yellow-400/10", dot: "bg-yellow-400" },
  error: { label: "Erro", color: "text-red-400", bg: "bg-red-400/10", dot: "bg-red-400" },
}

const logColors: Record<string, string> = {
  info: "text-muted-foreground",
  error: "text-red-400",
  warning: "text-yellow-400",
  success: "text-green-400",
}

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

function toFilterStatus(bot: ApiBot, status: BotStatusResponse | null): Exclude<BotStatusFilter, "all"> {
  const runtimeStatus = status?.monitor?.runtime?.status?.toLowerCase() ?? ""
  if (runtimeStatus.includes("error") || runtimeStatus.includes("fail")) {
    return "error"
  }

  return bot.is_running ? "active" : "paused"
}

export function BotsScreen() {
  const { addToast, selectedBotId, setSelectedBotId, withAuth } = useApp()

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<BotStatusFilter>("all")
  const [bots, setBots] = useState<ApiBot[]>([])
  const [botStatusById, setBotStatusById] = useState<Record<string, BotStatusResponse>>({})
  const [loadingBots, setLoadingBots] = useState(true)
  const [updatingBotId, setUpdatingBotId] = useState<string | null>(null)

  const [newBotName, setNewBotName] = useState("")
  const [creatingBot, setCreatingBot] = useState(false)

  const [selectedStatus, setSelectedStatus] = useState<BotStatusResponse | null>(null)
  const [selectedLogs, setSelectedLogs] = useState<BotLog[]>([])
  const [loadingSelectedMeta, setLoadingSelectedMeta] = useState(false)

  const loadBots = useCallback(async () => {
    setLoadingBots(true)
    try {
      const response = await withAuth((token) => botsService.list(token))
      setBots(response.bots)
      setBotStatusById((prev) => {
        const next: Record<string, BotStatusResponse> = {}
        for (const bot of response.bots) {
          const existing = prev[bot.id]
          if (existing) {
            next[bot.id] = existing
          }
        }
        return next
      })

      if (response.bots.length > 0) {
        void withAuth(async (token) => {
          const statuses = await Promise.all(
            response.bots.map(async (bot) => {
              try {
                const status = await botsService.getStatus(token, bot.id)
                return { botId: bot.id, status }
              } catch {
                return null
              }
            }),
          )

          setBotStatusById((prev) => {
            const next = { ...prev }
            for (const item of statuses) {
              if (item) {
                next[item.botId] = item.status
              }
            }
            return next
          })
        })
      }

      if (selectedBotId && !response.bots.some((bot) => bot.id === selectedBotId)) {
        setSelectedBotId(null)
      }
    } catch {
      addToast("Falha ao carregar bots.", "error")
    } finally {
      setLoadingBots(false)
    }
  }, [addToast, selectedBotId, setSelectedBotId, withAuth])

  const loadSelectedMeta = useCallback(
    async (botId: string) => {
      setLoadingSelectedMeta(true)
      try {
        const response = await withAuth(async (token) => {
          const [status, logs] = await Promise.all([
            botsService.getStatus(token, botId),
            botsService.getLogs(token, botId, 100),
          ])

          return { status, logs }
        })

        setSelectedStatus(response.status)
        setBotStatusById((prev) => ({ ...prev, [botId]: response.status }))
        setSelectedLogs(response.logs.logs)
      } catch {
        addToast("Falha ao carregar status/logs do bot.", "error")
      } finally {
        setLoadingSelectedMeta(false)
      }
    },
    [addToast, withAuth],
  )

  useEffect(() => {
    void loadBots()
  }, [loadBots])

  useEffect(() => {
    if (!selectedBotId) {
      setSelectedStatus(null)
      setSelectedLogs([])
      return
    }

    void loadSelectedMeta(selectedBotId)
  }, [loadSelectedMeta, selectedBotId])

  const filtered = useMemo(() => {
    return bots.filter((bot) => {
      const query = search.trim().toLowerCase()
      const matchesSearch = !query || bot.name.toLowerCase().includes(query) || bot.id.toLowerCase().includes(query)
      if (!matchesSearch) {
        return false
      }

      if (filterStatus === "all") {
        return true
      }

      const derivedStatus = selectedBotId === bot.id ? toFilterStatus(bot, selectedStatus) : toFilterStatus(bot, null)
      const statusFromCache = botStatusById[bot.id]
      const finalStatus = selectedBotId === bot.id ? derivedStatus : toFilterStatus(bot, statusFromCache ?? null)
      return finalStatus === filterStatus
    })
  }, [botStatusById, bots, filterStatus, search, selectedBotId, selectedStatus])

  const selectedBot = bots.find((bot) => bot.id === selectedBotId) ?? null

  async function createBot() {
    const name = newBotName.trim()
    if (!name) {
      addToast("Informe um nome para o bot.", "warning")
      return
    }

    setCreatingBot(true)
    try {
      const response = await withAuth((token) => botsService.create(token, { name }))
      setBots((prev) => [response.bot, ...prev])
      setNewBotName("")
      addToast("Bot criado com sucesso.", "success")
    } catch {
      addToast("Nao foi possivel criar o bot.", "error")
    } finally {
      setCreatingBot(false)
    }
  }

  async function toggleBot(bot: ApiBot) {
    setUpdatingBotId(bot.id)
    try {
      await withAuth(async (token) => {
        if (bot.is_running) {
          await botsService.pause(token, bot.id)
          return
        }

        await botsService.start(token, bot.id)
      })

      setBots((prev) => prev.map((item) => (item.id === bot.id ? { ...item, is_running: !bot.is_running } : item)))

      if (selectedBotId === bot.id) {
        await loadSelectedMeta(bot.id)
      }

      addToast(bot.is_running ? "Bot pausado com sucesso." : "Bot iniciado com sucesso.", "success")
    } catch {
      addToast("Falha ao atualizar estado do bot.", "error")
    } finally {
      setUpdatingBotId(null)
    }
  }

  if (selectedBot) {
    const detailStatus = toFilterStatus(selectedBot, selectedStatus)
    const cfg = statusConfig[detailStatus]

    return (
      <div className="flex flex-col gap-4 px-4 pt-5 pb-24">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedBotId(null)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-foreground truncate">{selectedBot.name}</h1>
            <div className={cn("flex items-center gap-1.5 text-xs font-medium", cfg.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot, detailStatus === "active" && "pulse")} />
              {cfg.label}
            </div>
          </div>

          <button
            onClick={() => void toggleBot(selectedBot)}
            disabled={updatingBotId === selectedBot.id}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-60",
              selectedBot.is_running
                ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                : "bg-green-400/10 text-green-400 border border-green-400/20",
            )}
          >
            {updatingBotId === selectedBot.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : selectedBot.is_running ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Iniciar
              </>
            )}
          </button>
        </div>

        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configuracao</h3>
            <button
              onClick={() => void loadSelectedMeta(selectedBot.id)}
              disabled={loadingSelectedMeta}
              className="text-xs text-primary flex items-center gap-1 disabled:opacity-60"
            >
              <RefreshCw className={cn("w-3 h-3", loadingSelectedMeta && "animate-spin")} /> Atualizar
            </button>
          </div>

          {[
            { label: "ID", value: selectedBot.id },
            { label: "Runtime", value: selectedStatus?.monitor?.runtime?.status ?? "-" },
            { label: "Worker", value: selectedStatus?.monitor?.worker?.running ? "running" : "stopped" },
            { label: "Stop Requested", value: selectedStatus?.monitor?.worker?.stopRequested ? "true" : "false" },
            { label: "Ultimo ciclo", value: formatDateTime(selectedStatus?.monitor?.runtime?.last_cycle_at) },
            { label: "Ultimo erro", value: selectedStatus?.monitor?.runtime?.last_error ?? "-" },
            { label: "Criado em", value: formatDateTime(selectedBot.created_at) },
            { label: "Atualizado em", value: formatDateTime(selectedBot.updated_at) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-medium text-foreground text-right max-w-[62%] break-words">{value}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logs de Atividade</h3>
          </div>

          <div className="glass rounded-2xl p-4 font-mono">
            {loadingSelectedMeta && selectedLogs.length === 0 && (
              <div className="text-[11px] text-muted-foreground">Carregando logs...</div>
            )}

            {!loadingSelectedMeta && selectedLogs.length === 0 && (
              <div className="text-[11px] text-muted-foreground">Nenhum log encontrado.</div>
            )}

            {selectedLogs.map((log) => (
              <div key={log.id} className="flex gap-2 text-[11px] leading-5">
                <span className="text-muted-foreground/50 shrink-0">{formatDateTime(log.created_at)}</span>
                <span className={cn("shrink-0 font-bold", logColors[log.level] ?? "text-foreground")}>[{log.level.toUpperCase()}]</span>
                <span className="text-foreground/80 break-words">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Bots</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {bots.filter((bot) => bot.is_running).length} ativos - {bots.length} total
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-3 flex items-center gap-2">
        <input
          value={newBotName}
          onChange={(event) => setNewBotName(event.target.value)}
          placeholder="Nome do novo bot"
          className="flex-1 h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
        />
        <button
          onClick={() => void createBot()}
          disabled={creatingBot}
          className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-white text-sm font-semibold red-glow disabled:opacity-60"
        >
          {creatingBot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Novo Bot
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou ID..."
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {(["all", "active", "paused", "error"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
              filterStatus === status ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {status === "all" ? "Todos" : statusConfig[status].label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <button onClick={() => void loadBots()} className="text-xs text-primary flex items-center gap-1">
          <RefreshCw className={cn("w-3 h-3", loadingBots && "animate-spin")} /> Recarregar
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loadingBots && (
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-3 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando bots...
          </div>
        )}

        {!loadingBots && filtered.length === 0 && (
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-3">
            <Bot className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum bot encontrado</p>
          </div>
        )}

        {!loadingBots && filtered.map((bot) => {
          const statusFromCache = botStatusById[bot.id]
          const status = toFilterStatus(bot, statusFromCache ?? null)
          const cfg = statusConfig[status]
          const isUpdating = updatingBotId === bot.id

          return (
            <div key={bot.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                    <Bot className={cn("w-4 h-4", cfg.color)} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{bot.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">{bot.id}</div>
                  </div>
                </div>
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0", cfg.color, cfg.bg)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot, status === "active" && "pulse")} />
                  {cfg.label}
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground mb-3">
                Atualizado em {formatDateTime(bot.updated_at)}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => void toggleBot(bot)}
                  disabled={isUpdating}
                  className={cn(
                    "flex-1 h-8 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60",
                    bot.is_running
                      ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                      : "bg-green-400/10 text-green-400 border border-green-400/20",
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : bot.is_running ? (
                    <>
                      <Pause className="w-3 h-3" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Iniciar
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedBotId(bot.id)}
                  className="flex-1 h-8 rounded-xl bg-secondary text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  Detalhes <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
