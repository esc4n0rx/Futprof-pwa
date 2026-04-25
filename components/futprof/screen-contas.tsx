"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CircleCheck,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { botsService } from "@/lib/services/bots-service"
import { accountsService } from "@/lib/services/accounts-service"
import { accountCreationService } from "@/lib/services/account-creation-service"
import type {
  Account,
  AccountBaseResponse,
  BaseAccountRecord,
  ConsumeAccountBasePayload,
  CreateAutomationAccountFailureResponse,
  CreateAutomationAccountResultSummary,
  CreateAutomationAccountSeed,
} from "@/lib/types/accounts"
import type { Bot } from "@/lib/types/bots"
import { cn } from "@/lib/utils"

interface AccountFormState {
  name: string
  baseUrl: string
  email: string
  password: string
  makePrimary: boolean
}

const EMPTY_FORM: AccountFormState = {
  name: "",
  baseUrl: "",
  email: "",
  password: "",
  makePrimary: false,
}

const ACCOUNT_CREATION_BASE_URL = "https://ingressos.flamengo.com.br/"

function formatDateTime(input: string | undefined): string {
  if (!input) {
    return "-"
  }

  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    return input
  }

  return parsed.toLocaleString("pt-BR")
}

function diagnosticsSummary(result: CreateAutomationAccountResultSummary | CreateAutomationAccountFailureResponse): string {
  const diagnostics = result.diagnostics
  const messages = [
    ...(diagnostics?.alerts ?? []),
    ...(diagnostics?.fieldErrors ?? []),
    ...(diagnostics?.validationMessages?.map((item) => `${item.name}: ${item.message}`) ?? []),
  ].filter(Boolean)

  return messages.slice(0, 2).join(" | ")
}

function normalizeSex(value: string): string {
  const normalized = value.trim().toLowerCase()
  if (normalized.startsWith("f")) {
    return "F"
  }

  if (normalized.startsWith("m")) {
    return "M"
  }

  return value
}

function toAutomationSeed(record: BaseAccountRecord, index: number): CreateAutomationAccountSeed {
  return {
    accountName: `Conta Auto ${record.cpf.slice(-4) || String(index + 1).padStart(3, "0")}`,
    baseUrl: ACCOUNT_CREATION_BASE_URL,
    nome: record.nome,
    cpf: record.cpf,
    rg: record.rg,
    data_nasc: record.data_nasc,
    sexo: normalizeSex(record.sexo),
    email: record.email,
    senha: record.senha,
    cep: record.cep,
    endereco: record.endereco,
    numero: Number(record.numero),
    bairro: record.bairro,
    cidade: record.cidade,
    estado: record.estado,
    celular: record.celular,
  }
}

async function fetchAccountBase(): Promise<BaseAccountRecord[]> {
  const response = await fetch("/api/account-base", { cache: "no-store" })
  if (!response.ok) {
    throw new Error("Falha ao carregar data/base.json.")
  }

  const payload = (await response.json()) as AccountBaseResponse
  return payload.accounts
}

async function consumeAccountBase(payload: ConsumeAccountBasePayload): Promise<void> {
  const response = await fetch("/api/account-base", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Falha ao atualizar data/base.json.")
  }
}

export function ContasScreen() {
  const { addToast, withAuth, selectedBotId, setSelectedBotId } = useApp()

  const [bots, setBots] = useState<Bot[]>([])
  const [loadingBots, setLoadingBots] = useState(true)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [actionAccountId, setActionAccountId] = useState<string | null>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [form, setForm] = useState<AccountFormState>(EMPTY_FORM)
  const [savingForm, setSavingForm] = useState(false)

  const [massQuantity, setMassQuantity] = useState("10")
  const [massCreating, setMassCreating] = useState(false)
  const [massResults, setMassResults] = useState<CreateAutomationAccountResultSummary[]>([])
  const [baseAccounts, setBaseAccounts] = useState<BaseAccountRecord[]>([])
  const [loadingBaseAccounts, setLoadingBaseAccounts] = useState(true)

  const activeBot = useMemo(() => bots.find((bot) => bot.id === selectedBotId) ?? null, [bots, selectedBotId])

  const loadBots = useCallback(async () => {
    setLoadingBots(true)
    try {
      const response = await withAuth((token) => botsService.list(token))
      setBots(response.bots)

      if (response.bots.length === 0) {
        setSelectedBotId(null)
        setAccounts([])
        return
      }

      if (!selectedBotId || !response.bots.some((bot) => bot.id === selectedBotId)) {
        setSelectedBotId(response.bots[0].id)
      }
    } catch {
      addToast("Falha ao carregar bots.", "error")
    } finally {
      setLoadingBots(false)
    }
  }, [addToast, selectedBotId, setSelectedBotId, withAuth])

  const loadAccounts = useCallback(
    async (botId: string) => {
      setLoadingAccounts(true)
      try {
        const response = await withAuth((token) => accountsService.list(token, botId))
        setAccounts(response.accounts)
      } catch {
        addToast("Falha ao carregar contas do bot.", "error")
      } finally {
        setLoadingAccounts(false)
      }
    },
    [addToast, withAuth],
  )

  const loadBaseAccounts = useCallback(async () => {
    setLoadingBaseAccounts(true)
    try {
      const accountsFromBase = await fetchAccountBase()
      setBaseAccounts(accountsFromBase)
    } catch {
      setBaseAccounts([])
      addToast("Falha ao carregar /data/base.json.", "error")
    } finally {
      setLoadingBaseAccounts(false)
    }
  }, [addToast])

  useEffect(() => {
    void loadBots()
  }, [loadBots])

  useEffect(() => {
    void loadBaseAccounts()
  }, [loadBaseAccounts])

  useEffect(() => {
    if (!selectedBotId) {
      setAccounts([])
      return
    }

    void loadAccounts(selectedBotId)
  }, [loadAccounts, selectedBotId])

  function openCreateModal() {
    setForm(EMPTY_FORM)
    setShowCreateModal(true)
  }

  function openEditModal(account: Account) {
    setEditingAccount(account)
    setForm({
      name: account.name,
      baseUrl: account.base_url,
      email: account.email,
      password: "",
      makePrimary: account.is_primary,
    })
    setShowEditModal(true)
  }

  async function handleCreateAccount() {
    if (!selectedBotId) {
      addToast("Selecione um bot para criar conta.", "warning")
      return
    }

    if (!form.name.trim() || !form.baseUrl.trim() || !form.email.trim() || !form.password.trim()) {
      addToast("Preencha nome, baseUrl, email e senha.", "warning")
      return
    }

    setSavingForm(true)
    try {
      await withAuth((token) =>
        accountsService.create(token, {
          botId: selectedBotId,
          name: form.name.trim(),
          baseUrl: form.baseUrl.trim(),
          email: form.email.trim(),
          password: form.password,
          makePrimary: form.makePrimary,
        }),
      )

      setShowCreateModal(false)
      setForm(EMPTY_FORM)
      addToast("Conta criada com sucesso.", "success")
      await loadAccounts(selectedBotId)
    } catch {
      addToast("Nao foi possivel criar a conta.", "error")
    } finally {
      setSavingForm(false)
    }
  }

  async function handleUpdateAccount() {
    if (!selectedBotId || !editingAccount) {
      addToast("Selecione uma conta para editar.", "warning")
      return
    }

    if (!form.name.trim() || !form.baseUrl.trim() || !form.email.trim() || !form.password.trim()) {
      addToast("Para editar, preencha nome, baseUrl, email e senha.", "warning")
      return
    }

    setSavingForm(true)
    try {
      await withAuth((token) =>
        accountsService.update(token, editingAccount.id, {
          botId: selectedBotId,
          name: form.name.trim(),
          baseUrl: form.baseUrl.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      )

      setShowEditModal(false)
      setEditingAccount(null)
      setForm(EMPTY_FORM)
      addToast("Conta atualizada com sucesso.", "success")
      await loadAccounts(selectedBotId)
    } catch {
      addToast("Nao foi possivel atualizar a conta.", "error")
    } finally {
      setSavingForm(false)
    }
  }

  async function handleRemoveAccount(accountId: string) {
    if (!selectedBotId) {
      return
    }

    setActionAccountId(accountId)
    try {
      await withAuth((token) => accountsService.remove(token, accountId, selectedBotId))
      addToast("Conta removida.", "info")
      await loadAccounts(selectedBotId)
    } catch {
      addToast("Nao foi possivel remover a conta.", "error")
    } finally {
      setActionAccountId(null)
    }
  }

  async function handleSetPrimary(accountId: string) {
    if (!selectedBotId) {
      return
    }

    setActionAccountId(accountId)
    try {
      await withAuth((token) => accountsService.setPrimary(token, { botId: selectedBotId, accountId }))
      addToast("Conta primaria atualizada.", "success")
      await loadAccounts(selectedBotId)
    } catch {
      addToast("Falha ao atualizar conta primaria.", "error")
    } finally {
      setActionAccountId(null)
    }
  }

  async function handleSetActive(accountId: string) {
    if (!selectedBotId) {
      return
    }

    setActionAccountId(accountId)
    try {
      await withAuth((token) => accountsService.setActive(token, { botId: selectedBotId, accountId }))
      addToast("Conta ativa atualizada.", "success")
      await loadAccounts(selectedBotId)
    } catch {
      addToast("Falha ao atualizar conta ativa.", "error")
    } finally {
      setActionAccountId(null)
    }
  }

  async function handleResetBotAccounts() {
    if (!selectedBotId) {
      return
    }

    setMassCreating(true)
    try {
      await withAuth((token) => accountsService.resetBot(token, selectedBotId))
      addToast("Estado de contas do bot resetado.", "info")
      await loadAccounts(selectedBotId)
    } catch {
      addToast("Falha ao resetar contas do bot.", "error")
    } finally {
      setMassCreating(false)
    }
  }

  async function handleMassCreate() {
    if (!selectedBotId) {
      addToast("Selecione um bot antes da criacao em massa.", "warning")
      return
    }

    const quantity = Number.parseInt(massQuantity, 10)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      addToast("Informe uma quantidade valida.", "warning")
      return
    }

    if (baseAccounts.length === 0) {
      addToast("Arquivo /data/base.json vazio ou indisponivel.", "error")
      return
    }

    const selectedBaseAccounts = baseAccounts.slice(0, quantity)
    const selectedSeeds = selectedBaseAccounts.map((record, index) => toAutomationSeed(record, index))
    if (selectedBaseAccounts.length < quantity) {
      addToast(`Somente ${selectedBaseAccounts.length} contas disponiveis no base.json.`, "warning")
    }

    if (selectedSeeds.length === 0) {
      return
    }

    setMassCreating(true)
    setMassResults([])
    try {
      const results = await withAuth((token) =>
        Promise.allSettled(
          selectedSeeds.map((seed) =>
            accountCreationService.create(token, {
              botId: selectedBotId,
              saveToBot: true,
              ...seed,
            }),
          ),
        ),
      )

      const summaries: CreateAutomationAccountResultSummary[] = results.map((result, index) => {
        const seed = selectedSeeds[index]
        if (result.status === "rejected") {
          return {
            success: false,
            email: seed.email,
            error: "Falha de comunicacao com o backend.",
          }
        }

        const value = result.value
        if (value.success) {
          return {
            success: true,
            email: value.email,
            savedToBot: value.savedToBot,
            accountId: value.accountId,
            saveError: value.saveError,
          }
        }

        return {
          success: false,
          email: value.email ?? seed.email,
          error: value.error,
          step: value.step,
          diagnostics: value.diagnostics,
          screenshotPath: value.screenshotPath,
        }
      })

      setMassResults(summaries)

      const siteSuccessCount = summaries.filter((result) => result.success).length
      const savedCount = summaries.filter((result) => result.success && result.savedToBot).length
      const saveFailCount = summaries.filter((result) => result.success && result.savedToBot === false).length
      const failCount = summaries.length - siteSuccessCount

      if (siteSuccessCount > 0) {
        addToast(`${siteSuccessCount} conta(s) criada(s) no site; ${savedCount} salva(s) no bot.`, "success")
      }

      if (saveFailCount > 0) {
        addToast(`${saveFailCount} conta(s) criadas, mas nao salvas no bot.`, "warning")
      }

      if (failCount > 0) {
        addToast(`${failCount} conta(s) falharam na criacao.`, "warning")
      }

      const consumed = summaries
        .filter((result) => result.success)
        .map((result) => {
          const source = selectedBaseAccounts.find((account) => account.email === result.email)
          return source ? { email: source.email, cpf: source.cpf } : null
        })
        .filter((item): item is { email: string; cpf: string } => Boolean(item))

      if (consumed.length > 0) {
        try {
          await consumeAccountBase({ used: consumed })
          setBaseAccounts((prev) => {
            const usedKeys = new Set(consumed.map((item) => `${item.email}|${item.cpf}`))
            return prev.filter((account) => !usedKeys.has(`${account.email}|${account.cpf}`))
          })
        } catch {
          addToast("Contas criadas, mas nao foi possivel remover do base.json.", "warning")
        }
      }

      await loadAccounts(selectedBotId)
    } catch {
      addToast("Falha na criacao em massa.", "error")
    } finally {
      setMassCreating(false)
    }
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-4">
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Bot selecionado</p>
            <p className="text-base font-bold text-foreground truncate">{activeBot?.name ?? "Nenhum bot"}</p>
          </div>
          <button onClick={() => void loadBots()} className="text-xs text-primary flex items-center gap-1" disabled={loadingBots}>
            <RefreshCw className={cn("w-3.5 h-3.5", loadingBots && "animate-spin")} /> Atualizar bots
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

      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Contas vinculadas ao bot</p>
          <p className="text-2xl font-black text-foreground">{accounts.length}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          disabled={!selectedBotId}
        >
          <Plus className="w-4 h-4" /> Nova conta
        </button>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Criacao em massa</h2>
          <button
            onClick={() => void loadBaseAccounts()}
            disabled={loadingBaseAccounts || massCreating}
            className="text-xs text-primary flex items-center gap-1 disabled:opacity-60"
          >
            <RefreshCw className={cn("w-3 h-3", loadingBaseAccounts && "animate-spin")} />
            {baseAccounts.length} no base.json
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={massQuantity}
            onChange={(event) => setMassQuantity(event.target.value)}
            className="w-28 h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          />
          <button
            onClick={() => void handleMassCreate()}
            disabled={!selectedBotId || massCreating || loadingBaseAccounts || baseAccounts.length === 0}
            className="h-10 px-4 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {massCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Criar em massa
          </button>
          <button
            onClick={() => void handleResetBotAccounts()}
            disabled={!selectedBotId || massCreating}
            className="h-10 px-4 rounded-xl bg-secondary text-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" /> Reset bot
          </button>
        </div>

        {massResults.length > 0 && (
          <div className="rounded-xl border border-border/80 bg-background/40 divide-y divide-border/60 overflow-hidden">
            {massResults.slice(0, 8).map((result, index) => {
              const ok = result.success && result.savedToBot !== false
              const partial = result.success && result.savedToBot === false
              const detail =
                result.saveError ||
                result.error ||
                diagnosticsSummary(result) ||
                (result.accountId ? `accountId: ${result.accountId}` : "Sem detalhe adicional.")

              return (
                <div key={`${result.email ?? index}-${index}`} className="p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-medium text-foreground truncate">{result.email ?? "email indisponivel"}</p>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full shrink-0",
                        ok && "bg-green-400/10 text-green-300",
                        partial && "bg-yellow-500/10 text-yellow-300",
                        !result.success && "bg-red-500/10 text-red-300",
                      )}
                    >
                      {ok ? "Salva" : partial ? "Criada no site" : result.step ?? "Falha"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 break-words">{detail}</p>
                </div>
              )
            })}
            {massResults.length > 8 && (
              <div className="p-2.5 text-[10px] text-muted-foreground">
                Mais {massResults.length - 8} resultado(s) omitido(s) nesta visualizacao.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {loadingAccounts && (
          <div className="glass rounded-2xl p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando contas...
          </div>
        )}

        {!loadingAccounts && accounts.length === 0 && (
          <div className="glass rounded-2xl p-8 flex flex-col items-center gap-2 text-center">
            <Users className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhuma conta vinculada ao bot selecionado.</p>
          </div>
        )}

        {!loadingAccounts && accounts.map((account) => {
          const isBusy = actionAccountId === account.id

          return (
            <div key={account.id} className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{account.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{account.base_url}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {account.is_primary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300">Primaria</span>
                  )}
                  {account.is_active ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/15 text-green-300">Ativa</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Inativa</span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Criada em {formatDateTime(account.created_at)} | Atualizada em {formatDateTime(account.updated_at)}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEditModal(account)}
                  className="h-9 rounded-xl bg-secondary text-xs font-semibold text-foreground flex items-center justify-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>

                <button
                  onClick={() => void handleRemoveAccount(account.id)}
                  disabled={isBusy}
                  className="h-9 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Remover
                </button>

                <button
                  onClick={() => void handleSetPrimary(account.id)}
                  disabled={isBusy}
                  className="h-9 rounded-xl bg-yellow-400/15 border border-yellow-400/30 text-xs font-semibold text-yellow-300 flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Marcar primaria
                </button>

                <button
                  onClick={() => void handleSetActive(account.id)}
                  disabled={isBusy}
                  className="h-9 rounded-xl bg-green-400/15 border border-green-400/30 text-xs font-semibold text-green-300 flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <CircleCheck className="w-3.5 h-3.5" /> Definir ativa
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6" onClick={() => {
          setShowCreateModal(false)
          setShowEditModal(false)
          setEditingAccount(null)
        }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass rounded-3xl p-6 w-full max-w-lg space-y-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-foreground">{showCreateModal ? "Nova conta" : "Editar conta"}</p>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  setEditingAccount(null)
                }}
                className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nome"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
              />
              <input
                type="text"
                placeholder="Base URL"
                value={form.baseUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, baseUrl: event.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
              />
              <input
                type="password"
                placeholder={showCreateModal ? "Senha" : "Senha (obrigatoria para update)"}
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
              />

              {showCreateModal && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.makePrimary}
                    onChange={(event) => setForm((prev) => ({ ...prev, makePrimary: event.target.checked }))}
                  />
                  Criar como primaria
                </label>
              )}
            </div>

            <button
              onClick={() => void (showCreateModal ? handleCreateAccount() : handleUpdateAccount())}
              disabled={savingForm}
              className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {savingForm ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {showCreateModal ? "Criar conta" : "Salvar alteracoes"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
