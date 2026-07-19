export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
}

export interface JwtPayload {
  sub: string
  email: string
  type: 'access' | 'refresh'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export interface SafeUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  alpacaAccountId: string | null
  createdAt: Date
  updatedAt: Date
}
