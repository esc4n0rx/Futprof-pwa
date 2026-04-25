"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { authService } from "@/lib/services/auth-service"
import { ApiError } from "@/lib/services/http-client"
import { resolveCurrentDevicePayload } from "@/lib/services/device-identity"
import { licensesService } from "@/lib/services/licenses-service"
import { clearSession, loadSession, saveSession } from "@/lib/services/session-storage"
import { settingsService } from "@/lib/services/settings-service"
import {
  applyTeamThemeToDocument,
  isTeamThemeId,
  TEAM_THEME_STORAGE_KEY,
  type TeamThemeId,
} from "@/lib/team-themes"
import type { AuthUser } from "@/lib/types/auth"
import type { LicenseData } from "@/lib/types/licenses"

export type Screen = "login" | "license-activation" | "home" | "bots" | "bot-detail" | "carrinho" | "contas" | "perfil"
export type LicenseStatus = "unknown" | "active" | "inactive"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
}

export interface AppUser {
  name: string
  email: string
  plan: string
  avatar: string
}

interface AppContextType {
  screen: Screen
  setScreen: (s: Screen) => void
  authLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (input: { name: string; email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  licenseStatus: LicenseStatus
  license: LicenseData | null
  licenseReason: string | null
  activateLicense: (code: string) => Promise<boolean>
  user: AppUser | null
  toasts: Toast[]
  addToast: (message: string, type: Toast["type"]) => void
  selectedBotId: string | null
  setSelectedBotId: (id: string | null) => void
  teamTheme: TeamThemeId
  setTeamTheme: (theme: TeamThemeId) => void
  withAuth: <T>(request: (accessToken: string) => Promise<T>) => Promise<T>
}

const AppContext = createContext<AppContextType | null>(null)

function toAppUser(authUser: AuthUser): AppUser {
  const normalizedName = authUser.name.trim()
  return {
    name: normalizedName,
    email: authUser.email,
    plan: "Pro",
    avatar: normalizedName.charAt(0).toUpperCase() || "U",
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("login")
  const [authLoading, setAuthLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<AppUser | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null)
  const [teamTheme, setTeamThemeState] = useState<TeamThemeId>("flamengo")
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>("unknown")
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [licenseReason, setLicenseReason] = useState<string | null>(null)

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const registerCurrentDevice = useCallback(async (token: string) => {
    try {
      await settingsService.registerDevice(token, resolveCurrentDevicePayload())
    } catch {
      // Device registration is best-effort; login flow should not fail because of it.
    }
  }, [])

  const applyAuthenticatedSession = useCallback((params: { accessToken: string; refreshToken: string; userData: AuthUser }) => {
    saveSession({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    })
    setAccessToken(params.accessToken)
    setRefreshToken(params.refreshToken)
    setUser(toAppUser(params.userData))
    setIsLoggedIn(true)
  }, [])

  const resolveLicenseGate = useCallback(
    async (token: string): Promise<boolean> => {
      const checked = await licensesService.check(token)

      if (checked.active) {
        setLicenseStatus("active")
        setLicense(checked.license)
        setLicenseReason(null)
        setScreen("home")
        await registerCurrentDevice(token)
        return true
      }

      setLicenseStatus("inactive")
      setLicense(null)
      setLicenseReason(checked.reason ?? "NO_ACTIVE_LICENSE")
      setScreen("license-activation")
      return false
    },
    [registerCurrentDevice],
  )

  const resetAuthState = useCallback(() => {
    clearSession()
    setAccessToken(null)
    setRefreshToken(null)
    setIsLoggedIn(false)
    setUser(null)
    setSelectedBotId(null)
    setLicenseStatus("unknown")
    setLicense(null)
    setLicenseReason(null)
    setScreen("login")
  }, [])

  const setTeamTheme = useCallback((nextTheme: TeamThemeId) => {
    setTeamThemeState(nextTheme)
    applyTeamThemeToDocument(nextTheme)

    if (typeof window !== "undefined") {
      window.localStorage.setItem(TEAM_THEME_STORAGE_KEY, nextTheme)
    }
  }, [])

  const withAuth = useCallback(
    async <T,>(request: (accessToken: string) => Promise<T>): Promise<T> => {
      const persisted = loadSession()
      const currentAccessToken = accessToken ?? persisted?.accessToken ?? null
      const currentRefreshToken = refreshToken ?? persisted?.refreshToken ?? null

      if (!currentAccessToken || !currentRefreshToken) {
        resetAuthState()
        throw new Error("User is not authenticated.")
      }

      try {
        return await request(currentAccessToken)
      } catch (error) {
        const status = error instanceof ApiError ? error.status : -1
        const shouldRefresh = status === 401 || status === 403
        if (!shouldRefresh) {
          throw error
        }
      }

      try {
        const refreshed = await authService.refresh({ refreshToken: currentRefreshToken })
        saveSession(refreshed)
        setAccessToken(refreshed.accessToken)
        setRefreshToken(refreshed.refreshToken)
        return await request(refreshed.accessToken)
      } catch (refreshError) {
        resetAuthState()
        throw refreshError
      }
    },
    [accessToken, refreshToken, resetAuthState],
  )

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password })
      applyAuthenticatedSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        userData: response.user,
      })
      await resolveLicenseGate(response.accessToken)
      return true
    } catch {
      return false
    }
  }, [applyAuthenticatedSession, resolveLicenseGate])

  const register = useCallback(
    async (input: { name: string; email: string; password: string }): Promise<boolean> => {
      try {
        const response = await authService.register({
          name: input.name,
          email: input.email,
          password: input.password,
        })
        applyAuthenticatedSession({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          userData: response.user,
        })
        await resolveLicenseGate(response.accessToken)
        return true
      } catch {
        return false
      }
    },
    [applyAuthenticatedSession, resolveLicenseGate],
  )

  const activateLicense = useCallback(
    async (code: string): Promise<boolean> => {
      const normalizedCode = code.trim()
      if (!normalizedCode) {
        return false
      }

      try {
        await withAuth(async (token) => {
          await licensesService.activate(token, { code: normalizedCode })
          return undefined
        })

        const persisted = loadSession()
        const token = persisted?.accessToken ?? accessToken ?? null
        if (!token) {
          return false
        }

        await resolveLicenseGate(token)
        return true
      } catch {
        return false
      }
    },
    [accessToken, resolveLicenseGate, withAuth],
  )

  const logout = useCallback(async () => {
    const localRefreshToken = refreshToken ?? loadSession()?.refreshToken

    if (localRefreshToken) {
      try {
        await authService.logout({ refreshToken: localRefreshToken })
      } catch {
        // Keep local logout flow resilient even if backend logout fails.
      }
    }

    resetAuthState()
    addToast("Sessao encerrada.", "info")
  }, [addToast, refreshToken, resetAuthState])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedTheme = window.localStorage.getItem(TEAM_THEME_STORAGE_KEY)
    if (storedTheme && isTeamThemeId(storedTheme)) {
      setTeamThemeState(storedTheme)
      applyTeamThemeToDocument(storedTheme)
      return
    }

    applyTeamThemeToDocument("flamengo")
  }, [])

  useEffect(() => {
    let mounted = true

    const hydrateAuth = async () => {
      try {
        const persisted = loadSession()
        if (!persisted) {
          return
        }

        setRefreshToken(persisted.refreshToken)
        setAccessToken(persisted.accessToken)

        try {
          const meResponse = await authService.me(persisted.accessToken)
          if (!mounted) {
            return
          }

          applyAuthenticatedSession({
            accessToken: persisted.accessToken,
            refreshToken: persisted.refreshToken,
            userData: meResponse.user,
          })
          await resolveLicenseGate(persisted.accessToken)
          return
        } catch (error) {
          const status = error instanceof ApiError ? error.status : -1
          const canTryRefresh = status === 401 || status === 403
          if (!canTryRefresh) {
            throw error
          }
        }

        const refreshed = await authService.refresh({ refreshToken: persisted.refreshToken })
        if (!mounted) {
          return
        }

        saveSession(refreshed)
        setAccessToken(refreshed.accessToken)
        setRefreshToken(refreshed.refreshToken)

        const meAfterRefresh = await authService.me(refreshed.accessToken)
        if (!mounted) {
          return
        }

        applyAuthenticatedSession({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          userData: meAfterRefresh.user,
        })
        await resolveLicenseGate(refreshed.accessToken)
      } catch {
        if (!mounted) {
          return
        }

        resetAuthState()
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    void hydrateAuth()

    return () => {
      mounted = false
    }
  }, [applyAuthenticatedSession, resetAuthState, resolveLicenseGate])

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        authLoading,
        isLoggedIn,
        login,
        register,
        logout,
        licenseStatus,
        license,
        licenseReason,
        activateLicense,
        user,
        toasts,
        addToast,
        selectedBotId,
        setSelectedBotId,
        teamTheme,
        setTeamTheme,
        withAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
