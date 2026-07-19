import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '../../config/env.js'
import { logger, logSafe } from '../../config/logger.js'
import { AlpacaApiError } from '../../utils/errors.js'
import { alpacaAuthService } from './auth.service.js'
import { getAlpacaRequestToken } from './context.js'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _alpacaRetried?: boolean
}

async function resolveAccessToken(): Promise<string> {
  const requestToken = getAlpacaRequestToken()
  if (requestToken) return requestToken
  return alpacaAuthService.getAccessToken()
}

function mapAlpacaError(
  error: AxiosError<{ message?: string; code?: number }>,
  serviceName: string
): never {
  const status = error.response?.status ?? 502
  const message =
    error.response?.data?.message ?? error.message ?? 'Alpaca API request failed'
  const requestId = error.response?.headers?.['x-request-id'] as string | undefined
  const alpacaCode = error.response?.data?.code

  logger.error(`Alpaca ${serviceName} error`, {
    status,
    message,
    url: error.config?.url,
    requestId,
    alpacaCode,
  })

  throw new AlpacaApiError(
    message,
    status >= 400 && status < 600 ? status : 502,
    alpacaCode,
    requestId
  )
}

function attachAuthInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await resolveAccessToken()
    config.headers.Authorization = `Bearer ${token}`
    return config
  })
}

function attachInterceptors(client: AxiosInstance, serviceName: string): AxiosInstance {
  attachAuthInterceptor(client)

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    logger.debug(`Alpaca ${serviceName} request`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: logSafe(config.params),
      usingRequestToken: !!getAlpacaRequestToken(),
    })
    return config
  })

  client.interceptors.response.use(
    (response) => {
      logger.debug(`Alpaca ${serviceName} response`, {
        status: response.status,
        url: response.config.url,
        requestId: response.headers['x-request-id'],
      })
      return response
    },
    async (error: AxiosError<{ message?: string; code?: number }>) => {
      const config = error.config as RetryableRequest | undefined

      if (error.response?.status === 401 && config && !config._alpacaRetried) {
        config._alpacaRetried = true

        if (!getAlpacaRequestToken()) {
          alpacaAuthService.clearToken()
        }

        const token = await resolveAccessToken()
        config.headers.Authorization = `Bearer ${token}`
        return client.request(config)
      }

      return mapAlpacaError(error, serviceName)
    }
  )

  return client
}

export const alpacaBrokerClient = attachInterceptors(
  axios.create({
    baseURL: env.ALPACA_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
  }),
  'Broker'
)

export const alpacaDataClient = attachInterceptors(
  axios.create({
    baseURL: env.ALPACA_DATA_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
  }),
  'MarketData'
)
