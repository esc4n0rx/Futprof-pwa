export interface AuthUser {
  id: string
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthSuccessResponse extends AuthTokens {
  user: AuthUser
}

export interface AuthMeResponse {
  user: AuthUser
}
