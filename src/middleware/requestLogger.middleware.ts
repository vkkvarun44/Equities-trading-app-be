import type { Request, Response, NextFunction } from 'express'
import { logger, logSafe } from '../config/logger.js'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('HTTP request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      query: logSafe(req.query),
    })
  })

  next()
}
