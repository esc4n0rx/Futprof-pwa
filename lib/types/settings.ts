export interface PasswordOtpRequestPayload {
  email: string
}

export interface PasswordOtpRequestResponse {
  message: string
  sent: boolean
  otpPreview?: string
}

export interface PasswordOtpResetPayload {
  email: string
  otp: string
  newPassword: string
}

export interface PasswordOtpResetResponse {
  reset: boolean
}

export interface DevicePayload {
  deviceId: string
  deviceName: string
  platform: string
  appVersion: string
}

export interface DeviceRecord {
  id: string
  device_id: string
  device_name: string
  platform: string
  app_version: string
  last_ip?: string | null
  last_user_agent?: string | null
  last_seen_at: string
  created_at: string
  updated_at: string
}

export interface RegisterDeviceResponse {
  device: DeviceRecord
}

export interface ListDevicesResponse {
  devices: DeviceRecord[]
}
