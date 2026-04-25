"use client"

import { useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { setupOneSignal } from "@/lib/services/onesignal-client"
import { pushService } from "@/lib/services/push-service"

export function PushBootstrap() {
  const { isLoggedIn, licenseStatus, withAuth } = useApp()

  useEffect(() => {
    if (!isLoggedIn || licenseStatus !== "active") {
      return
    }

    let cancelled = false

    const initPush = async () => {
      try {
        const config = await withAuth((token) => pushService.config(token))
        const push = config.push

        if (!push.enabled || push.provider !== "onesignal" || !push.appId || !push.externalUserId) {
          return
        }

        await setupOneSignal({
          appId: push.appId,
          externalUserId: push.externalUserId,
        })
      } catch {
        if (cancelled) {
          return
        }
      }
    }

    void initPush()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn, licenseStatus, withAuth])

  return null
}
