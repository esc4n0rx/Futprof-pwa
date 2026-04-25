"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { botsService } from "@/lib/services/bots-service"
import { monitoringService } from "@/lib/services/monitoring-service"
import type { MonitorNotification } from "@/lib/types/monitoring"
import { cn } from "@/lib/utils"

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: "border-green-500/30 text-green-400",
  error: "border-red-500/30 text-red-400",
  warning: "border-yellow-500/30 text-yellow-400",
  info: "border-blue-500/30 text-blue-400",
}

function formatMonitoringToast(item: MonitorNotification): string {
  const normalized = item.type.replaceAll("_", " ").toLowerCase()
  const eventName = item.payload?.eventName
  const sectorName = item.payload?.sectorName
  const reason = item.payload?.reason

  if (eventName || sectorName || reason) {
    return `Monitor: ${[normalized, eventName, sectorName, reason].filter(Boolean).join(" - ")}`
  }

  return `Monitor: ${normalized} (evento ${item.event_id || "-"})`
}

export function ToastContainer() {
  const { toasts, withAuth, selectedBotId, addToast } = useApp()
  const seenNotificationIdsRef = useRef<Set<number>>(new Set())
  const firstSyncDoneRef = useRef(false)

  useEffect(() => {
    let mounted = true

    const pullMonitoringNotifications = async () => {
      try {
        const botData = await withAuth((token) => botsService.list(token))
        const activeBots = botData.bots.filter((bot) => bot.is_running)
        if (activeBots.length === 0) {
          return
        }

        const activeBot =
          (selectedBotId ? activeBots.find((bot) => bot.id === selectedBotId) : null) ??
          activeBots[0]

        const notificationsData = await withAuth((token) => monitoringService.notifications(token, activeBot.id, 20))
        if (!mounted) {
          return
        }

        const notifications = [...notificationsData.notifications].sort((a, b) => a.id - b.id)
        const seenIds = seenNotificationIdsRef.current

        if (!firstSyncDoneRef.current) {
          for (const item of notifications) {
            seenIds.add(item.id)
          }
          firstSyncDoneRef.current = true
          return
        }

        for (const item of notifications) {
          if (seenIds.has(item.id)) {
            continue
          }

          seenIds.add(item.id)
          addToast(formatMonitoringToast(item), item.type === "PURCHASE_FAILED" ? "warning" : "info")
        }
      } catch {
        // Keep toast polling resilient; UI toasts should not crash on monitor errors.
      }
    }

    void pullMonitoringNotifications()
    const interval = setInterval(() => {
      void pullMonitoringNotifications()
    }, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [addToast, selectedBotId, withAuth])

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              "toast-in flex items-center gap-3 px-4 py-3 rounded-xl border pointer-events-auto",
              "glass shadow-2xl min-w-[260px] max-w-[320px]",
              colors[toast.type],
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm text-foreground flex-1 leading-snug">{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}
