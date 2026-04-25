import { httpClient } from "@/lib/services/http-client"
import type {
  ListDevicesResponse,
  PasswordOtpRequestPayload,
  PasswordOtpRequestResponse,
  PasswordOtpResetPayload,
  PasswordOtpResetResponse,
  RegisterDeviceResponse,
  DevicePayload,
} from "@/lib/types/settings"

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export const settingsService = {
  requestPasswordOtp(payload: PasswordOtpRequestPayload): Promise<PasswordOtpRequestResponse> {
    return httpClient<PasswordOtpRequestResponse>("/api/settings/password/otp/request", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  resendPasswordOtp(payload: PasswordOtpRequestPayload): Promise<PasswordOtpRequestResponse> {
    return httpClient<PasswordOtpRequestResponse>("/api/settings/password/otp/resend", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  resetPasswordWithOtp(payload: PasswordOtpResetPayload): Promise<PasswordOtpResetResponse> {
    return httpClient<PasswordOtpResetResponse>("/api/settings/password/otp/reset", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  registerDevice(accessToken: string, payload: DevicePayload): Promise<RegisterDeviceResponse> {
    return httpClient<RegisterDeviceResponse>("/api/settings/devices/register", {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    })
  },

  listDevices(accessToken: string): Promise<ListDevicesResponse> {
    return httpClient<ListDevicesResponse>("/api/settings/devices", {
      method: "GET",
      headers: authHeaders(accessToken),
    })
  },

  removeDevice(accessToken: string, deviceId: string): Promise<void> {
    return httpClient<void>(`/api/settings/devices/${deviceId}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    })
  },
}
