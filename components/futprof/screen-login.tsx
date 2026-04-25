"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, Zap, ChevronRight } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"

type Tab = "login" | "register"

interface LoginFormState {
  email: string
  password: string
}

interface RegisterFormState {
  name: string
  email: string
  password: string
  confirm: string
}

const registerMainFields: Array<{ key: keyof RegisterFormState; label: string; placeholder: string; type: string }> = [
  { key: "name", label: "Nome completo", placeholder: "Seu nome", type: "text" },
  { key: "email", label: "E-mail", placeholder: "seu@email.com", type: "email" },
]

const registerPasswordFields: Array<{ key: "password" | "confirm"; label: string }> = [
  { key: "password", label: "Senha" },
  { key: "confirm", label: "Confirmar senha" },
]

export function LoginScreen() {
  const { login, register, addToast } = useApp()
  const [tab, setTab] = useState<Tab>("login")
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loginForm, setLoginForm] = useState<LoginFormState>({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      addToast("Preencha todos os campos.", "error")
      return
    }

    setLoading(true)
    const ok = await login(loginForm.email.trim(), loginForm.password)
    setLoading(false)

    if (!ok) {
      addToast("Falha no login. Verifique suas credenciais.", "error")
      return
    }

    addToast("Login realizado.", "success")
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      addToast("Preencha todos os campos.", "error")
      return
    }
    if (registerForm.password !== registerForm.confirm) {
      addToast("As senhas nao coincidem.", "error")
      return
    }

    setLoading(true)
    const ok = await register({
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    })
    setLoading(false)

    if (!ok) {
      addToast("Nao foi possivel criar sua conta.", "error")
      return
    }

    addToast("Conta criada com sucesso.", "success")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.52 0.22 25) 0%, transparent 70%)" }}
      />

      <div className="flex flex-col items-center gap-3 mb-8 slide-up z-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center red-glow">
          <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-foreground text-balance">FutProf</h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">Gerenciamento profissional de bots</p>
        </div>
      </div>

      <div className="glass rounded-3xl w-full max-w-sm p-6 z-10 slide-up shadow-2xl">
        <div className="flex bg-secondary/50 rounded-2xl p-1 mb-6">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                tab === t ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="........"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="button" className="text-xs text-primary text-right hover:underline w-full transition-colors">
              Redefinir senha na aba Perfil
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 red-glow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {registerMainFields.map(({ key, label, placeholder, type }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={registerForm[key]}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            ))}
            {registerPasswordFields.map(({ key, label }) => {
              const show = key === "password" ? showPass : showConfirm
              const toggle = key === "password" ? () => setShowPass((v) => !v) : () => setShowConfirm((v) => !v)
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      placeholder="........"
                      value={registerForm[key]}
                      onChange={(e) => setRegisterForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full h-12 px-4 pr-12 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 red-glow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground/50 z-10">FutProf (c) 2025 - Todos os direitos reservados</p>
    </div>
  )
}
