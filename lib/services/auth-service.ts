import { httpClient } from "@/lib/services/http-client"
import type {
  AuthMeResponse,
  AuthSuccessResponse,
  AuthTokens,
} from "@/lib/types/auth"

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  register(payload: RegisterPayload): Promise<AuthSuccessResponse> {
    return httpClient<AuthSuccessResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  login(payload: LoginPayload): Promise<AuthSuccessResponse> {
    return httpClient<AuthSuccessResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  refresh(tokens: Pick<AuthTokens, "refreshToken">): Promise<AuthTokens> {
    return httpClient<AuthTokens>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify(tokens),
    })
  },

  logout(tokens: Pick<AuthTokens, "refreshToken">): Promise<void> {
    return httpClient<void>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify(tokens),
    })
  },

  me(accessToken: string): Promise<AuthMeResponse> {
    return httpClient<AuthMeResponse>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },
}
