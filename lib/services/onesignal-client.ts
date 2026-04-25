type OneSignalLike = {
  init: (options: {
    appId: string
    serviceWorkerPath?: string
    serviceWorkerUpdaterPath?: string
    serviceWorkerParam?: { scope: string }
  }) => Promise<void> | void
  login: (externalUserId: string) => Promise<void> | void
  Notifications?: {
    permission?: boolean
    requestPermission?: () => Promise<void> | void
  }
}

declare global {
  interface Window {
    OneSignal?: OneSignalLike
    OneSignalDeferred?: Array<(OneSignal: OneSignalLike) => void>
    __futprofOneSignalPromise?: Promise<OneSignalLike>
  }
}

const ONESIGNAL_SDK_URL = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"

let initializedAppId: string | null = null

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

async function loadOneSignalSdk(): Promise<OneSignalLike> {
  if (!isBrowser()) {
    throw new Error("OneSignal requires browser environment.")
  }

  if (window.OneSignal) {
    return window.OneSignal
  }

  if (window.__futprofOneSignalPromise) {
    return window.__futprofOneSignalPromise
  }

  window.OneSignalDeferred = window.OneSignalDeferred || []

  window.__futprofOneSignalPromise = new Promise<OneSignalLike>((resolve, reject) => {
    window.OneSignalDeferred!.push((OneSignal) => resolve(OneSignal))

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${ONESIGNAL_SDK_URL}"]`)
    if (existingScript) {
      existingScript.addEventListener("error", () => reject(new Error("Failed to load OneSignal SDK.")))
      return
    }

    const script = document.createElement("script")
    script.src = ONESIGNAL_SDK_URL
    script.defer = true
    script.onerror = () => reject(new Error("Failed to load OneSignal SDK."))
    document.head.appendChild(script)
  })

  return window.__futprofOneSignalPromise
}

export async function setupOneSignal(options: { appId: string; externalUserId: string }): Promise<void> {
  const appId = options.appId.trim()
  const externalUserId = options.externalUserId.trim()

  if (!appId || !externalUserId) {
    throw new Error("Invalid OneSignal setup arguments.")
  }

  const oneSignal = await loadOneSignalSdk()

  if (initializedAppId !== appId) {
    await oneSignal.init({
      appId,
      serviceWorkerPath: "/push/onesignal/OneSignalSDKWorker.js",
      serviceWorkerUpdaterPath: "/push/onesignal/OneSignalSDKUpdaterWorker.js",
      serviceWorkerParam: { scope: "/push/onesignal/" },
    })
    initializedAppId = appId
  }

  await oneSignal.login(externalUserId)
}

export async function requestOneSignalPermission(): Promise<boolean> {
  const oneSignal = await loadOneSignalSdk()

  if (!oneSignal.Notifications?.requestPermission) {
    return false
  }

  await oneSignal.Notifications.requestPermission()
  return Boolean(oneSignal.Notifications.permission)
}

export async function isOneSignalPermissionGranted(): Promise<boolean> {
  const oneSignal = await loadOneSignalSdk()
  return Boolean(oneSignal.Notifications?.permission)
}
