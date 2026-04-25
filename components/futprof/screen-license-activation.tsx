"use client"

import { useState } from "react"
import { KeyRound, Loader2, LogOut, ShieldAlert } from "lucide-react"
import { useApp } from "@/lib/app-context"

export function LicenseActivationScreen() {
  const { activateLicense, licenseReason, logout, addToast } = useApp()
  const [licenseCode, setLicenseCode] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleActivate() {
    if (!licenseCode.trim()) {
      addToast("Informe um codigo de licenca.", "warning")
      return
    }

    setLoading(true)
    const ok = await activateLicense(licenseCode.trim())
    setLoading(false)

    if (!ok) {
      addToast("Falha ao ativar licenca. Verifique o codigo.", "error")
      return
    }

    addToast("Licenca ativada com sucesso.", "success")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="glass rounded-3xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-yellow-300" />
          <h1 className="text-lg font-bold text-foreground">Ativacao de Licenca</h1>
        </div>

        <p className="text-xs text-muted-foreground">
          Seu acesso esta autenticado, mas uma licenca ativa e obrigatoria para usar o aplicativo.
        </p>
        {licenseReason && <p className="text-xs text-yellow-300">Motivo retornado: {licenseReason}</p>}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Codigo da licenca</label>
          <input
            type="text"
            placeholder="LIC-AAAA-BBBB-CCCC-DDDD"
            value={licenseCode}
            onChange={(event) => setLicenseCode(event.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-input border border-border text-sm text-foreground"
          />
        </div>

        <button
          onClick={() => void handleActivate()}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          Ativar licenca
        </button>

        <button
          onClick={() => void logout()}
          className="w-full h-10 rounded-xl bg-secondary text-foreground text-sm font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </div>
  )
}
