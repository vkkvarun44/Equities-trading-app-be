import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../config/logger.js'
import {
  AppError,
  ValidationError,
  AlpacaApiError,
} from '../utils/errors.js'
import type { ApiResponse } from '../types/index.js'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`))
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500
  let message = 'Internal server error'
  let errors: Record<string, string[]> | undefined

  if (err instanceof ValidationError) {
    statusCode = err.statusCode
    message = err.message
    errors = err.errors
  } else if (err instanceof AlpacaApiError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err instanceof ZodError) {
    statusCode = 400
    message = 'Validation failed'
    errors = {}
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'root'
      if (!errors[path]) errors[path] = []
      errors[path].push(issue.message)
    }
  }

  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    })
  } else {
    logger.warn('Client error', { statusCode, message, name: err.name })
  }

  const body: ApiResponse<null | { errors?: Record<string, string[]> }> = {
    success: false,
    message,
    data: errors ? { errors } : null,
  }

  res.status(statusCode).json(body)
}
