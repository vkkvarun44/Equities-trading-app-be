import { Redis } from 'ioredis'
import { env } from './env.js'
import { logger } from './logger.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

let redisAvailable = false

export function isRedisAvailable(): boolean {
  return redisAvailable
}

redis.on('error', (err: Error) => {
  if (redisAvailable) {
    logger.error('Redis connection error', { error: err.message })
  }
})

redis.on('connect', () => {
  redisAvailable = true
  logger.info('Redis connected')
})

export async function connectRedis(): Promise<boolean> {
  if (redis.status === 'ready') {
    redisAvailable = true
    return true
  }
  if (redis.status === 'connecting') return redisAvailable

  try {
    await redis.connect()
    redisAvailable = true
    return true
  } catch (err) {
    redisAvailable = false
    if (env.NODE_ENV === 'development') {
      logger.warn('Redis unavailable — using in-memory fallbacks for local development')
      return false
    }
    throw err
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis.status === 'end') return
  try {
    await redis.quit()
  } catch {
    // ignore disconnect errors when redis was never connected
  }
  redisAvailable = false
}
