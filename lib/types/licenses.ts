export interface LicenseData {
  code: string
  validDays: number
  activatedAt: string
  expiresAt: string
}

export type LicenseInactiveReason = "NO_ACTIVE_LICENSE" | "LICENSE_EXPIRED" | string

export interface LicenseCheckActiveResponse {
  active: true
  license: LicenseData
}

export interface LicenseCheckInactiveResponse {
  active: false
  reason: LicenseInactiveReason
}

export type LicenseCheckResponse = LicenseCheckActiveResponse | LicenseCheckInactiveResponse

export interface ActivateLicensePayload {
  code: string
}

export interface ActivateLicenseResponse {
  activated: boolean
  alreadyActive: boolean
  license: LicenseData
}
