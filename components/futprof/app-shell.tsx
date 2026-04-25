"use client"

import { useApp } from "@/lib/app-context"
import { BottomNav } from "./bottom-nav"
import { ToastContainer } from "./toast-container"
import { LoginScreen } from "./screen-login"
import { HomeScreen } from "./screen-home"
import { BotsScreen } from "./screen-bots"
import { CarrinhoScreen } from "./screen-carrinho"
import { PerfilScreen } from "./screen-perfil"
import { ContasScreen } from "./screen-contas"
import { LicenseActivationScreen } from "./screen-license-activation"

const screenLabels: Record<string, string> = {
  home: "Home",
  bots: "Bots",
  "bot-detail": "Detalhes do Bot",
  carrinho: "Carrinho",
  contas: "Contas",
  perfil: "Perfil",
}

export function AppShell() {
  const { screen, isLoggedIn, authLoading, licenseStatus } = useApp()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl px-5 py-4 text-sm text-muted-foreground">Restaurando sessao...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    )
  }

  if (licenseStatus === "inactive") {
    return (
      <>
        <LicenseActivationScreen />
        <ToastContainer />
      </>
    )
  }

  if (licenseStatus === "unknown") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl px-5 py-4 text-sm text-muted-foreground">Validando licenca...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-navbar px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-black">F</span>
          </div>
          <span className="font-bold text-sm text-foreground">
            {screenLabels[screen] ?? "FutProf"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 pulse" />
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
      </header>

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto">
        {screen === "home" && <HomeScreen />}
        {(screen === "bots" || screen === "bot-detail") && <BotsScreen />}
        {screen === "carrinho" && <CarrinhoScreen />}
        {screen === "contas" && <ContasScreen />}
        {screen === "perfil" && <PerfilScreen />}
      </main>

      <BottomNav />
      <ToastContainer />
    </div>
  )
}
