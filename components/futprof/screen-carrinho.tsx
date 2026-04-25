"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Target,
  Ticket,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { botsService } from "@/lib/services/bots-service"
import { purchaseService } from "@/lib/services/purchase-service"
import { cartService } from "@/lib/services/cart-service"
import { monitoringService } from "@/lib/services/monitoring-service"
import type { Bot as BotType } from "@/lib/types/bots"
import type { CartResponse } from "@/lib/types/cart"
import type { MonitorSectorSession } from "@/lib/types/monitoring"
import type { PurchaseTarget } from "@/lib/types/purchase"
import { cn } from "@/lib/utils"

interface AttemptForm {
  eventId: string
  sectorId: string
  sectorName: string
  price: string
}

const EMPTY_ATTEMPT_FORM: AttemptForm = {
  eventId: "",
  sectorId: "",
  sectorName: "",
  price: "",
}

export function CarrinhoScreen() {
  const { addToast, withAuth, selectedBotId, setSelectedBotId } = useApp()

  const [bots, setBots] = useState<BotType[]>([])
  const [loadingBots, setLoadingBots] = useState(true)

  const [targets, setTargets] = useState<PurchaseTarget[]>([])
  const [loadingTargets, setLoadingTargets] = useState(false)
  const [sectorSessions, setSectorSessions] = useState<MonitorSectorSession[]>([])
  const [loadingSectors, setLoadingSectors] = useState(false)

  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loadingCart, setLoadingCart] = useState(false)

  const [togglingEventId, setTogglingEventId] = useState<string | null>(null)
  const [enableAllLoading, setEnableAllLoading] = useState(false)

  const [attemptForm, setAttemptForm] = useState<AttemptForm>(EMPTY_ATTEMPT_FORM)
  const [attemptLoading, setAttemptLoading] = useState(false)

  const selectedBot = useMemo(() => bots.find((bot) => bot.id === selectedBotId) ?? null, [bots, selectedBotId])
  const activeBots = useMemo(() => bots.filter((bot) => bot.is_running), [bots])
  const selectedActiveBotId = useMemo(() => {
    if (selectedBotId && activeBots.some((bot) => bot.id === selectedBotId)) {
      return selectedBotId
    }
    return activeBots[0]?.id ?? null
  }, [activeBots, selectedBotId])
  const hasActiveBot = activeBots.length > 0

  const loadBots = useCallback(async () => {
    setLoadingBots(true)
    try {
      const response = await withAuth((token) => botsService.list(token))
      setBots(response.bots)

      const active = response.bots.filter((bot) => bot.is_running)

      if (response.bots.length === 0) {
        setSelectedBotId(null)
        return
      }

      if (active.length === 0) {
        if (!selectedBotId || !response.bots.some((bot) => bot.id === selectedBotId)) {
          setSelectedBotId(response.bots[0].id)
        }
        return
      }

      if (!selectedBotId || !active.some((bot) => bot.id === selectedBotId)) {
        setSelectedBotId(active[0].id)
      }
    } catch {
      addToast("Falha ao carregar bots.", "error")
    } finally {
      setLoadingBots(false)
    }
  }, [addToast, selectedBotId, setSelectedBotId, withAuth])

  const loadTargets = useCallback(
    async (botId: string) => {
      setLoadingTargets(true)
      try {
        const response = await withAuth((token) => purchaseService.getTargets(token, botId))
        setTargets(response.targets)
      } catch {
        addToast("Falha ao carregar alvos.", "error")
      } finally {
        setLoadingTargets(false)
      }
    },
    [addToast, withAuth],
  )

  const loadCart = useCallback(
    async (botId: string) => {
      setLoadingCart(true)
      try {
        const response = await withAuth((token) => cartService.getRealtime(token, botId))
        setCart(response)
      } catch {
        addToast("Falha ao carregar carrinho.", "error")
      } finally {
        setLoadingCart(false)
      }
    },
    [addToast, withAuth],
  )

  const loadSectors = useCallback(
    async (botId: string) => {
      setLoadingSectors(true)
      try {
        const response = await withAuth((token) => monitoringService.sectors(token, botId))
        setSectorSessions(response.sessions)
      } catch {
        addToast("Falha ao carregar setores.", "error")
      } finally {
        setLoadingSectors(false)
      }
    },
    [addToast, withAuth],
  )

  useEffect(() => {
    void loadBots()
  }, [loadBots])

  useEffect(() => {
    if (!selectedActiveBotId) {
      setTargets([])
      setCart(null)
      setSectorSessions([])
      setAttemptForm(EMPTY_ATTEMPT_FORM)
      return
    }

    void Promise.all([loadTargets(selectedActiveBotId), loadCart(selectedActiveBotId), loadSectors(selectedActiveBotId)])
  }, [loadCart, loadSectors, loadTargets, selectedActiveBotId])

  const sectorsByEventId = useMemo(
    () =>
      sectorSessions.reduce<Record<string, MonitorSectorSession["sectors"]>>((acc, session) => {
        acc[session.eventId] = session.sectors
        return acc
      }, {}),
    [sectorSessions],
  )

  const selectedEventSectors = useMemo(
    () => sectorsByEventId[attemptForm.eventId] ?? [],
    [attemptForm.eventId, sectorsByEventId],
  )

  async function toggleTarget(eventId: string) {
    if (!selectedActiveBotId) {
      addToast("Monitoramento exige ao menos 1 bot ativo.", "warning")
      return
    }

    setTogglingEventId(eventId)
    try {
      await withAuth((token) => purchaseService.toggleTarget(token, { botId: selectedActiveBotId, eventId }))
      await loadTargets(selectedActiveBotId)
      addToast("Alvo atualizado.", "success")
    } catch {
      addToast("Falha ao alternar alvo.", "error")
    } finally {
      setTogglingEventId(null)
    }
  }

  async function enableAllTargets() {
    if (!selectedActiveBotId) {
      addToast("Monitoramento exige ao menos 1 bot ativo.", "warning")
      return
    }

    setEnableAllLoading(true)
    try {
      await withAuth((token) => purchaseService.enableAllTargets(token, selectedActiveBotId))
      await loadTargets(selectedActiveBotId)
      addToast("Todos os alvos foram habilitados.", "success")
    } catch {
      addToast("Falha ao habilitar todos os alvos.", "error")
    } finally {
      setEnableAllLoading(false)
    }
  }

  async function attemptManualPurchase() {
    if (!selectedActiveBotId) {
      addToast("Selecione um bot antes da tentativa manual.", "warning")
      return
    }

    if (!attemptForm.eventId || !attemptForm.sectorId || !attemptForm.sectorName || !attemptForm.price) {
      addToast("Preencha todos os campos da tentativa manual.", "warning")
      return
    }

    setAttemptLoading(true)
    try {
      const response = await withAuth((token) =>
        purchaseService.attemptPurchase(token, {
          botId: selectedActiveBotId,
          eventId: attemptForm.eventId,
          sectorId: attemptForm.sectorId,
          sectorName: attemptForm.sectorName,
          price: attemptForm.price,
        }),
      )

      addToast(
        `Tentativa concluida: ${response.accountName} reservou ${response.ticketCount}/${response.maxTicketsPerAccount}.`,
        response.success ? "success" : "warning",
      )

      setAttemptForm(EMPTY_ATTEMPT_FORM)
      await loadCart(selectedActiveBotId)
    } catch {
      addToast("Falha na tentativa manual de compra.", "error")
    } finally {
      setAttemptLoading(false)
    }
  }

  const enabledTargets = targets.filter((target) => target.enabled).length

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-24">
      <div>
        <h1 className="text-2xl font-black text-foreground">Carrinho</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gerencie alvos e acompanhe o carrinho atual das contas.</p>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Bot atual</p>
            <p className="text-sm font-bold text-foreground truncate">{selectedBot?.name ?? "Nenhum bot"}</p>
            {!selectedBot?.is_running && selectedBot && (
              <p className="text-[10px] text-yellow-300 mt-0.5">Bot selecionado esta pausado.</p>
            )}
          </div>
          <button onClick={() => void loadBots()} className="text-xs text-primary flex items-center gap-1" disabled={loadingBots}>
            <RefreshCw className={cn("w-3.5 h-3.5", loadingBots && "animate-spin")} /> Atualizar
          </button>
        </div>

        <select
          value={selectedBotId ?? ""}
          onChange={(event) => setSelectedBotId(event.target.value || null)}
          className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          disabled={loadingBots || bots.length === 0}
        >
          {bots.length === 0 && <option value="">Nenhum bot disponivel</option>}
          {bots.map((bot) => (
            <option key={bot.id} value={bot.id}>
              {bot.name}
            </option>
          ))}
        </select>
      </div>

      {!hasActiveBot && (
        <div className="glass rounded-2xl p-4 border border-yellow-400/25">
          <p className="text-sm font-semibold text-yellow-300">Monitoramento indisponivel</p>
          <p className="text-xs text-muted-foreground mt-1">
            As rotas de carrinho e compra so funcionam com pelo menos 1 bot ativo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Target className="w-4 h-4" /> Alvos habilitados
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{enabledTargets}</div>
          <div className="text-[10px] text-muted-foreground">de {targets.length} eventos</div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Ticket className="w-4 h-4" /> Ingressos no carrinho
          </div>
          <div className="text-2xl font-black text-foreground mt-1">{cart?.totalTickets ?? 0}</div>
          <div className="text-[10px] text-muted-foreground">tempo real</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Alvos de compra</h2>
          <button
            onClick={() => void enableAllTargets()}
            disabled={!selectedActiveBotId || enableAllLoading}
            className="h-8 px-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
          >
            {enableAllLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Habilitar todos
          </button>
        </div>

        {loadingTargets && <div className="text-xs text-muted-foreground">Carregando alvos...</div>}
        {!loadingTargets && targets.length === 0 && <div className="text-xs text-muted-foreground">Nenhum alvo disponivel.</div>}

        {!loadingTargets && targets.map((target) => {
          const isLoading = togglingEventId === target.eventId
          const eventSectors = sectorsByEventId[target.eventId] ?? []
          return (
            <div key={target.eventId} className="bg-secondary/40 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{target.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">eventId: {target.eventId}</p>
                </div>

                <button
                  onClick={() => void toggleTarget(target.eventId)}
                  disabled={isLoading || !selectedActiveBotId}
                  className={cn(
                    "h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60",
                    target.enabled
                      ? "bg-green-500/15 border border-green-500/30 text-green-300"
                      : "bg-secondary border border-border text-muted-foreground",
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : target.enabled ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                  {target.enabled ? "Ligado" : "Desligado"}
                </button>
              </div>

              <div className="rounded-lg border border-border/80 bg-background/40 p-2.5">
                <p className="text-[10px] text-muted-foreground mb-1.5">
                  Setores monitorados: {eventSectors.length}
                </p>
                {loadingSectors && <p className="text-[10px] text-muted-foreground">Carregando setores...</p>}
                {!loadingSectors && eventSectors.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">Nenhum setor encontrado para este evento.</p>
                )}
                {!loadingSectors && eventSectors.length > 0 && (
                  <div className="space-y-1.5">
                    {eventSectors.map((sector) => (
                      <div key={`${target.eventId}-${sector.sectorId}`} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] text-foreground truncate">{sector.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">setorId: {sector.sectorId}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] text-foreground">{sector.price}</p>
                          <p className={cn("text-[10px]", sector.available ? "text-green-300" : "text-muted-foreground")}>
                            {sector.available ? "Disponivel" : "Fechado"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Tentativa manual de reserva</h2>
        <select
          value={attemptForm.eventId}
          onChange={(event) => {
            const eventId = event.target.value
            setAttemptForm((prev) => ({ ...prev, eventId, sectorId: "", sectorName: "", price: "" }))
          }}
          className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          disabled={targets.length === 0 || !selectedActiveBotId}
        >
          <option value="">Selecione o evento alvo</option>
          {targets.map((target) => (
            <option key={target.eventId} value={target.eventId}>
              {target.name}
            </option>
          ))}
        </select>

        <select
          value={attemptForm.sectorId}
          onChange={(event) => {
            const selectedSector = selectedEventSectors.find((sector) => sector.sectorId === event.target.value)
            if (!selectedSector) {
              setAttemptForm((prev) => ({ ...prev, sectorId: "", sectorName: "", price: "" }))
              return
            }

            setAttemptForm((prev) => ({
              ...prev,
              sectorId: selectedSector.sectorId,
              sectorName: selectedSector.name,
              price: selectedSector.price,
            }))
          }}
          className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          disabled={!attemptForm.eventId || selectedEventSectors.length === 0 || !selectedActiveBotId}
        >
          <option value="">Selecione o setor</option>
          {selectedEventSectors.map((sector) => (
            <option key={`${attemptForm.eventId}-${sector.sectorId}`} value={sector.sectorId}>
              {sector.name} - {sector.price}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Setor ID"
            value={attemptForm.sectorId}
            onChange={(event) => setAttemptForm((prev) => ({ ...prev, sectorId: event.target.value }))}
            className="h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          />
          <input
            type="text"
            placeholder="Preco (ex: R$ 80)"
            value={attemptForm.price}
            onChange={(event) => setAttemptForm((prev) => ({ ...prev, price: event.target.value }))}
            className="h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          />
        </div>

        <input
          type="text"
          placeholder="Nome do setor"
          value={attemptForm.sectorName}
          onChange={(event) => setAttemptForm((prev) => ({ ...prev, sectorName: event.target.value }))}
          className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
        />

        <button
          onClick={() => void attemptManualPurchase()}
          disabled={!selectedActiveBotId || attemptLoading}
          className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {attemptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Tentar reservar
        </button>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Carrinho atual por conta</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (cart?.cartUrl) {
                  window.open(cart.cartUrl, "_blank", "noopener,noreferrer")
                } else {
                  addToast("URL do carrinho indisponivel.", "warning")
                }
              }}
              className="h-8 px-3 rounded-xl bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Abrir carrinho
            </button>
            <button
              onClick={() => {
                if (selectedBotId) {
                  if (!selectedActiveBotId) {
                    addToast("Monitoramento exige ao menos 1 bot ativo.", "warning")
                    return
                  }
                  void loadCart(selectedActiveBotId)
                }
              }}
              className="h-8 px-3 rounded-xl bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5"
              disabled={!selectedActiveBotId || loadingCart}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loadingCart && "animate-spin")} /> Atualizar
            </button>
          </div>
        </div>

        {loadingCart && <div className="text-xs text-muted-foreground">Carregando carrinho...</div>}

        {!loadingCart && !cart && (
          <div className="text-xs text-muted-foreground">Sem dados de carrinho.</div>
        )}

        {!loadingCart && cart && (
          <>
            <div className="text-xs text-muted-foreground">
              {cart.hasLocalData ? "Dados locais sincronizados" : "Sem dados locais"}
            </div>

            {cart.divergences.length > 0 && (
              <div className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-2.5">
                Divergencias detectadas: {cart.divergences.join(", ")}
              </div>
            )}

            {cart.events.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Nenhum ingresso no carrinho agora.</p>
              </div>
            )}

            {cart.events.map((eventItem) => (
              <div key={eventItem.eventId} className="bg-secondary/40 rounded-xl p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{eventItem.eventName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">eventId: {eventItem.eventId}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Hold</p>
                    <p className="text-xs text-foreground">{eventItem.hold.sectorName}</p>
                    <p className="text-[10px] text-muted-foreground">{eventItem.hold.price}</p>
                    <p className="text-[10px] text-yellow-300">{eventItem.hold.remainingSeconds}s</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {eventItem.tickets.map((ticket) => (
                    <div key={ticket.accountId} className="rounded-lg border border-border bg-background/40 px-2.5 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{ticket.accountName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">accountId: {ticket.accountId}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-foreground">{ticket.count} ingresso(s)</p>
                        <p className="text-[10px] text-muted-foreground">{ticket.remainingSeconds}s restantes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
