"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Loader2, LogOut, RefreshCw, Shield, Smartphone, XCircle } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { resolveCurrentDevicePayload } from "@/lib/services/device-identity"
import { licensesService } from "@/lib/services/licenses-service"
import { settingsService } from "@/lib/services/settings-service"
import type { LicenseCheckResponse } from "@/lib/types/licenses"
import type { DeviceRecord } from "@/lib/types/settings"
import { cn } from "@/lib/utils"

function formatDateTime(input: string): string {
  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    return input
  }
  return parsed.toLocaleString("pt-BR")
}

function daysUntil(input: string): number | null {
  const expiresAt = new Date(input).getTime()
  if (Number.isNaN(expiresAt)) {
    return null
  }

  const now = Date.now()
  const diff = expiresAt - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function PerfilScreen() {
  const { user, withAuth, addToast, logout } = useApp()

  const [license, setLicense] = useState<LicenseCheckResponse | null>(null)
  const [loadingLicense, setLoadingLicense] = useState(false)

  const [devices, setDevices] = useState<DeviceRecord[]>([])
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null)
  const [registeringDevice, setRegisteringDevice] = useState(false)

  const [otpEmail, setOtpEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [otpPreview, setOtpPreview] = useState<string | null>(null)
  const [requestingOtp, setRequestingOtp] = useState(false)
  const [resendingOtp, setResendingOtp] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    setOtpEmail(user?.email ?? "")
  }, [user?.email])

  const currentDevicePayload = useMemo(() => resolveCurrentDevicePayload(), [])

  const loadLicense = useCallback(async () => {
    setLoadingLicense(true)
    try {
      const response = await withAuth((token) => licensesService.check(token))
      setLicense(response)
    } catch {
      addToast("Falha ao carregar licenca.", "error")
    } finally {
      setLoadingLicense(false)
    }
  }, [addToast, withAuth])

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true)
    try {
      const response = await withAuth((token) => settingsService.listDevices(token))
      setDevices(response.devices)
    } catch {
      addToast("Falha ao carregar dispositivos.", "error")
    } finally {
      setLoadingDevices(false)
    }
  }, [addToast, withAuth])

  useEffect(() => {
    void Promise.all([loadLicense(), loadDevices()])
  }, [loadDevices, loadLicense])

  async function handleRequestOtp() {
    if (!otpEmail.trim()) {
      addToast("Informe um e-mail para receber o OTP.", "warning")
      return
    }

    setRequestingOtp(true)
    try {
      const response = await settingsService.requestPasswordOtp({ email: otpEmail.trim() })
      setOtpPreview(response.otpPreview ?? null)
      addToast("OTP solicitado. Verifique seu e-mail.", "success")
    } catch {
      addToast("Falha ao solicitar OTP.", "error")
    } finally {
      setRequestingOtp(false)
    }
  }

  async function handleResendOtp() {
    if (!otpEmail.trim()) {
      addToast("Informe um e-mail para reenviar o OTP.", "warning")
      return
    }

    setResendingOtp(true)
    try {
      const response = await settingsService.resendPasswordOtp({ email: otpEmail.trim() })
      setOtpPreview(response.otpPreview ?? null)
      addToast("OTP reenviado.", "success")
    } catch {
      addToast("Falha ao reenviar OTP.", "error")
    } finally {
      setResendingOtp(false)
    }
  }

  async function handleResetPassword() {
    if (!otpEmail.trim() || !otpCode.trim() || !newPassword.trim()) {
      addToast("Preencha e-mail, OTP e nova senha.", "warning")
      return
    }

    setResettingPassword(true)
    try {
      await settingsService.resetPasswordWithOtp({
        email: otpEmail.trim(),
        otp: otpCode.trim(),
        newPassword: newPassword.trim(),
      })
      setOtpCode("")
      setNewPassword("")
      addToast("Senha redefinida com sucesso.", "success")
    } catch {
      addToast("Falha ao redefinir senha com OTP.", "error")
    } finally {
      setResettingPassword(false)
    }
  }

  async function handleRemoveDevice(deviceId: string) {
    setRemovingDeviceId(deviceId)
    try {
      await withAuth((token) => settingsService.removeDevice(token, deviceId))
      addToast("Dispositivo removido.", "success")
      await loadDevices()
    } catch {
      addToast("Falha ao remover dispositivo.", "error")
    } finally {
      setRemovingDeviceId(null)
    }
  }

  async function handleRegisterCurrentDevice() {
    setRegisteringDevice(true)
    try {
      await withAuth((token) => settingsService.registerDevice(token, currentDevicePayload))
      addToast("Dispositivo atual registrado.", "success")
      await loadDevices()
    } catch {
      addToast("Falha ao registrar dispositivo atual.", "error")
    } finally {
      setRegisteringDevice(false)
    }
  }

  const activeLicenseDays = license?.active ? daysUntil(license.license.expiresAt) : null

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-24">
      <div className="glass rounded-2xl p-4">
        <h1 className="text-2xl font-black text-foreground">Perfil</h1>
        <p className="text-xs text-muted-foreground mt-1">{user?.name}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" /> Licenca
          </h2>
          <button onClick={() => void loadLicense()} className="text-xs text-primary flex items-center gap-1" disabled={loadingLicense}>
            <RefreshCw className={cn("w-3.5 h-3.5", loadingLicense && "animate-spin")} /> Atualizar
          </button>
        </div>

        {loadingLicense && <p className="text-xs text-muted-foreground">Carregando licenca...</p>}

        {!loadingLicense && license?.active && (
          <div className="rounded-xl border border-green-500/35 bg-green-500/10 p-3">
            <div className="flex items-center gap-2 text-green-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Licenca ativa
            </div>
            <p className="text-[11px] text-foreground mt-2">Codigo: {license.license.code}</p>
            <p className="text-[11px] text-muted-foreground">Valida ate: {formatDateTime(license.license.expiresAt)}</p>
            <p className="text-[11px] text-muted-foreground">
              {activeLicenseDays === null ? "Dias restantes: -" : `Dias restantes: ${activeLicenseDays}`}
            </p>
          </div>
        )}

        {!loadingLicense && license && !license.active && (
          <div className="rounded-xl border border-yellow-500/35 bg-yellow-500/10 p-3">
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-semibold">
              <XCircle className="w-4 h-4" /> Licenca inativa
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Motivo: {license.reason}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Para ativar, saia e entre novamente informando um codigo de licenca valido.
            </p>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Conta e reset de senha (OTP)</h2>

        <input
          type="email"
          value={otpEmail}
          onChange={(event) => setOtpEmail(event.target.value)}
          placeholder="E-mail da conta"
          className="w-full h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => void handleRequestOtp()}
            disabled={requestingOtp}
            className="h-10 rounded-xl bg-secondary text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {requestingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Solicitar OTP
          </button>
          <button
            onClick={() => void handleResendOtp()}
            disabled={resendingOtp}
            className="h-10 rounded-xl bg-secondary text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {resendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Reenviar OTP
          </button>
        </div>

        {otpPreview && (
          <p className="text-[11px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/35 rounded-xl p-2.5">
            OTP preview (ambiente nao-producao): {otpPreview}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value)}
            placeholder="Codigo OTP"
            className="h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Nova senha"
            className="h-10 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          />
        </div>

        <button
          onClick={() => void handleResetPassword()}
          disabled={resettingPassword}
          className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {resettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Redefinir senha
        </button>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Dispositivos ativos
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => void loadDevices()} className="text-xs text-primary flex items-center gap-1" disabled={loadingDevices}>
              <RefreshCw className={cn("w-3.5 h-3.5", loadingDevices && "animate-spin")} /> Atualizar
            </button>
            <button
              onClick={() => void handleRegisterCurrentDevice()}
              className="h-8 px-3 rounded-xl bg-secondary text-xs font-semibold text-foreground disabled:opacity-60"
              disabled={registeringDevice}
            >
              {registeringDevice ? "Registrando..." : "Registrar este dispositivo"}
            </button>
          </div>
        </div>

        {loadingDevices && <p className="text-xs text-muted-foreground">Carregando dispositivos...</p>}
        {!loadingDevices && devices.length === 0 && <p className="text-xs text-muted-foreground">Nenhum dispositivo registrado.</p>}

        {!loadingDevices && devices.map((device) => (
          <div key={device.id} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground truncate">{device.device_name}</p>
              <button
                onClick={() => void handleRemoveDevice(device.id)}
                disabled={removingDeviceId === device.id}
                className="text-[11px] text-red-300 disabled:opacity-60"
              >
                {removingDeviceId === device.id ? "Removendo..." : "Remover"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">deviceId: {device.device_id}</p>
            <p className="text-[10px] text-muted-foreground">Plataforma: {device.platform} | Versao: {device.app_version}</p>
            <p className="text-[10px] text-muted-foreground">Ultimo acesso: {formatDateTime(device.last_seen_at)}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 space-y-2.5">
        <h2 className="text-sm font-semibold text-foreground">Suporte e documentacao</h2>
        <p className="text-xs text-muted-foreground">
          O sistema exige bot ativo para monitoramento, compra e carrinho. Fluxo principal: configurar contas no bot, ativar
          monitoramento de eventos e setores, habilitar alvos de compra e acompanhar divergencias no carrinho em tempo real.
        </p>
        <p className="text-xs text-muted-foreground">
          Endpoints principais: `/monitor/events`, `/monitor/sectors`, `/purchase/targets`, `/cart`, `/settings/devices` e
          `/licenses/check`.
        </p>
        <p className="text-xs text-muted-foreground">
          Para suporte operacional: validar credenciais das contas, status do bot (running), escopo de setores e licenca ativa.
        </p>
      </div>

      <button
        onClick={() => void logout()}
        className="h-11 rounded-xl bg-red-500/10 border border-red-500/35 text-red-300 text-sm font-semibold flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" /> Sair da conta
      </button>
    </div>
  )
}
