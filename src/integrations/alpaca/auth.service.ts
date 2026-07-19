import axios, { isAxiosError } from 'axios'
import { env } from '../../config/env.js'
import { logger } from '../../config/logger.js'
import { AlpacaApiError } from '../../utils/errors.js'

interface OAuthTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface OAuthErrorResponse {
  error?: string
  error_description?: string
}

const TOKEN_REFRESH_BUFFER_MS = 60_000

class AlpacaAuthService {
  private accessToken: string | null = null
  private expiresAt = 0
  private refreshPromise: Promise<string> | null = null

  async getAccessToken(): Promise<string> {
    const now = Date.now()

    if (this.accessToken && now < this.expiresAt - TOKEN_REFRESH_BUFFER_MS) {
      return this.accessToken
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.fetchAccessToken().finally(() => {
        this.refreshPromise = null
      })
    }

    return this.refreshPromise
  }

  clearToken(): void {
    this.accessToken = null
    this.expiresAt = 0
  }

  async getTokenDetails(): Promise<{
    accessToken: string
    expiresIn: number
    tokenType: string
  }> {
    const accessToken = await this.getAccessToken()
    const expiresIn = Math.max(0, Math.floor((this.expiresAt - Date.now()) / 1000))

    return {
      accessToken,
      expiresIn,
      tokenType: 'Bearer',
    }
  }

  private async fetchAccessToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.ALPACA_CLIENT_ID,
      client_secret: env.ALPACA_CLIENT_SECRET,
    })

    logger.debug('Requesting Alpaca OAuth access token')

    try {
      const { data } = await axios.post<OAuthTokenResponse>(env.ALPACA_AUTH_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15_000,
      })

      this.accessToken = data.access_token
      this.expiresAt = Date.now() + data.expires_in * 1000

      logger.info('Alpaca OAuth token acquired', {
        expiresInSeconds: data.expires_in,
        tokenType: data.token_type,
      })

      return this.accessToken
    } catch (error) {
      if (isAxiosError<OAuthErrorResponse>(error)) {
        const oauthError = error.response?.data?.error ?? 'oauth_error'
        const description = error.response?.data?.error_description
        const status = error.response?.status === 400 ? 401 : (error.response?.status ?? 502)

        logger.error('Alpaca OAuth token request failed', {
          status,
          oauthError,
          description,
        })

        throw new AlpacaApiError(
          description ??
            `Alpaca authentication failed (${oauthError}). Use Broker OAuth client_id and client_secret from the Alpaca Broker dashboard — Trading API keys will not work.`,
          status >= 400 && status < 600 ? status : 401
        )
      }

      throw error
    }
  }
}

export const alpacaAuthService = new AlpacaAuthService()
