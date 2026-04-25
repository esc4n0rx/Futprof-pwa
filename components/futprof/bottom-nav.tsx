"use client"

import { Home, Bot, ShoppingCart, Users, User } from "lucide-react"
import { useApp, type Screen } from "@/lib/app-context"
import { cn } from "@/lib/utils"

const tabs: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "bots", label: "Bots", icon: Bot },
  { id: "carrinho", label: "Carrinho", icon: ShoppingCart },
  { id: "contas", label: "Contas", icon: Users },
  { id: "perfil", label: "Perfil", icon: User },
]

export function BottomNav() {
  const { screen, setScreen } = useApp()
  const activeScreen = screen === "bot-detail" ? "bots" : screen

  return (
    <nav className="glass-navbar fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeScreen === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200",
                isActive && "bg-primary/15"
              )}>
                <Icon className={cn("w-5 h-5 transition-all duration-200", isActive && "drop-shadow-[0_0_6px_rgba(220,38,38,0.7)]")} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-wide transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
