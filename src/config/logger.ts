import winston from 'winston'
import { env } from './env.js'

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'password_hash',
  'api_key',
  'api_secret',
  'authorization',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
]

function redactSensitive(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(redactSensitive)

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      result[key] = '[REDACTED]'
    } else if (typeof value === 'object') {
      result[key] = redactSensitive(value)
    } else {
      result[key] = value
    }
  }
  return result
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tradeflow-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(redactSensitive(meta))}` : ''
          return `${timestamp} [${level}]: ${message}${metaStr}`
        })
      ),
    }),
  ],
})

export function logSafe(data: unknown): unknown {
  return redactSensitive(data)
}
