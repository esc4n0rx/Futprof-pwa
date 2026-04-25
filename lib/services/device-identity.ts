import type { DevicePayload } from "@/lib/types/settings"

const DEVICE_STORAGE_KEY = "futprof.device.identity"
const APP_VERSION = "web-0.1.0"

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `web-${crypto.randomUUID()}`
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getBrowserName(userAgent: string): string {
  const normalized = userAgent.toLowerCase()
  if (normalized.includes("edg/")) return "Edge"
  if (normalized.includes("firefox/")) return "Firefox"
  if (normalized.includes("opr/") || normalized.includes("opera/")) return "Opera"
  if (normalized.includes("safari/") && !normalized.includes("chrome/")) return "Safari"
  if (normalized.includes("chrome/")) return "Chrome"
  return "Browser"
}

export function resolveCurrentDevicePayload(): DevicePayload {
  if (typeof window === "undefined") {
    return {
      deviceId: "web-server",
      deviceName: "Web Server",
      platform: "web",
      appVersion: APP_VERSION,
    }
  }

  const storedId = window.localStorage.getItem(DEVICE_STORAGE_KEY)
  const deviceId = storedId || createDeviceId()
  if (!storedId) {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, deviceId)
  }

  const browser = getBrowserName(window.navigator.userAgent || "")
  const platform = window.navigator.platform || "web"

  return {
    deviceId,
    deviceName: `${browser} (${platform})`,
    platform: "web",
    appVersion: APP_VERSION,
  }
}
