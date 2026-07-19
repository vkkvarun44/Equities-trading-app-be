import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { env } from './config/env.js'
import { isRedisAvailable, redis } from './config/redis.js'
import { requestLogger } from './middleware/requestLogger.middleware.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import routes from './routes/index.js'

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    })
  )
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(requestLogger)

  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
      data: null,
    },
    ...(isRedisAvailable()
      ? {
          store: new RedisStore({
            sendCommand: (command: string, ...args: string[]) =>
              redis.call(command, ...args) as Promise<number>,
            prefix: 'rl:',
          }),
        }
      : {}),
  })

  app.use(limiter)
  app.use(env.API_PREFIX, routes)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
