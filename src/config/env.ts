import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('/api'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  ALPACA_CLIENT_ID: z.string().min(1).optional(),
  ALPACA_CLIENT_SECRET: z.string().min(1).optional(),
  ALPACA_API_KEY: z.string().min(1).optional(),
  ALPACA_API_SECRET: z.string().min(1).optional(),
  ALPACA_AUTH_URL: z.string().url().optional(),
  ALPACA_BASE_URL: z.string().url().default('https://broker-api.sandbox.alpaca.markets'),
  ALPACA_DATA_URL: z.string().url().default('https://data.sandbox.alpaca.markets'),
})
  .transform((data) => {
    const clientId = data.ALPACA_CLIENT_ID ?? data.ALPACA_API_KEY
    const clientSecret = data.ALPACA_CLIENT_SECRET ?? data.ALPACA_API_SECRET

    if (!clientId || !clientSecret) {
      throw new Error(
        'Missing Alpaca credentials: set ALPACA_CLIENT_ID and ALPACA_CLIENT_SECRET (or ALPACA_API_KEY and ALPACA_API_SECRET)'
      )
    }

    const isSandbox = data.ALPACA_BASE_URL.includes('sandbox')

    return {
      ...data,
      ALPACA_CLIENT_ID: clientId,
      ALPACA_CLIENT_SECRET: clientSecret,
      ALPACA_AUTH_URL:
        data.ALPACA_AUTH_URL ??
        (isSandbox
          ? 'https://authx.sandbox.alpaca.markets/v1/oauth2/token'
          : 'https://authx.alpaca.markets/v1/oauth2/token'),
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
