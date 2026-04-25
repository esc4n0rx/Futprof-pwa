export type TeamThemeId = "flamengo" | "botafogo" | "palmeiras" | "vasco"

export interface TeamTheme {
  id: TeamThemeId
  label: string
  description: string
  colors: {
    primary: string
    primaryForeground: string
    accent: string
    ring: string
    red: string
    redGlow: string
    redMuted: string
  }
}

export const TEAM_THEME_STORAGE_KEY = "futprof.team.theme"

export const TEAM_THEMES: TeamTheme[] = [
  {
    id: "flamengo",
    label: "Flamengo",
    description: "Preto e vermelho",
    colors: {
      primary: "oklch(0.52 0.22 25)",
      primaryForeground: "oklch(0.98 0 0)",
      accent: "oklch(0.52 0.22 25)",
      ring: "oklch(0.52 0.22 25)",
      red: "oklch(0.52 0.22 25)",
      redGlow: "oklch(0.52 0.22 25 / 0.35)",
      redMuted: "oklch(0.52 0.22 25 / 0.15)",
    },
  },
  {
    id: "botafogo",
    label: "Botafogo",
    description: "Preto e branco",
    colors: {
      primary: "oklch(0.98 0 0)",
      primaryForeground: "oklch(0.12 0 0)",
      accent: "oklch(0.98 0 0)",
      ring: "oklch(0.98 0 0)",
      red: "oklch(0.98 0 0)",
      redGlow: "oklch(1 0 0 / 0.28)",
      redMuted: "oklch(1 0 0 / 0.12)",
    },
  },
  {
    id: "palmeiras",
    label: "Palmeiras",
    description: "Verde, branco e preto",
    colors: {
      primary: "oklch(0.58 0.18 150)",
      primaryForeground: "oklch(0.98 0 0)",
      accent: "oklch(0.58 0.18 150)",
      ring: "oklch(0.58 0.18 150)",
      red: "oklch(0.58 0.18 150)",
      redGlow: "oklch(0.58 0.18 150 / 0.35)",
      redMuted: "oklch(0.58 0.18 150 / 0.15)",
    },
  },
  {
    id: "vasco",
    label: "Vasco",
    description: "Preto e branco",
    colors: {
      primary: "oklch(0.95 0 0)",
      primaryForeground: "oklch(0.12 0 0)",
      accent: "oklch(0.95 0 0)",
      ring: "oklch(0.95 0 0)",
      red: "oklch(0.63 0.24 25)",
      redGlow: "oklch(0.63 0.24 25 / 0.35)",
      redMuted: "oklch(0.63 0.24 25 / 0.16)",
    },
  },
]

export function getTeamTheme(teamId: TeamThemeId): TeamTheme {
  return TEAM_THEMES.find((theme) => theme.id === teamId) ?? TEAM_THEMES[0]
}

export function isTeamThemeId(value: string): value is TeamThemeId {
  return TEAM_THEMES.some((theme) => theme.id === value)
}

export function applyTeamThemeToDocument(teamId: TeamThemeId): void {
  if (typeof document === "undefined") {
    return
  }

  const theme = getTeamTheme(teamId)
  const root = document.documentElement
  root.dataset.team = theme.id
  root.style.setProperty("--primary", theme.colors.primary)
  root.style.setProperty("--primary-foreground", theme.colors.primaryForeground)
  root.style.setProperty("--accent", theme.colors.accent)
  root.style.setProperty("--ring", theme.colors.ring)
  root.style.setProperty("--destructive", theme.colors.primary)
  root.style.setProperty("--red", theme.colors.red)
  root.style.setProperty("--red-glow", theme.colors.redGlow)
  root.style.setProperty("--red-muted", theme.colors.redMuted)
}
