import { createApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { connectRedis, disconnectRedis } from './config/redis.js'
import { connectDatabase, disconnectDatabase } from './database/prisma.js'

async function bootstrap(): Promise<void> {
  await connectDatabase()
  await connectRedis() // optional in development when Redis is not installed

  const app = createApp()

  const server = app.listen(env.PORT, () => {
    logger.info(`TradeFlow API running on port ${env.PORT}`, {
      environment: env.NODE_ENV,
      apiPrefix: env.API_PREFIX,
    })
  })

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`)
    server.close(async () => {
      await disconnectDatabase()
      await disconnectRedis()
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error: error.message, stack: error.stack })
  process.exit(1)
})
