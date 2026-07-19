import type { Response } from 'express'
import type { ApiResponse } from '../types/index.js'

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response {
  const body: ApiResponse<T> = { success: true, message, data }
  return res.status(statusCode).json(body)
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500
): Response {
  const body: ApiResponse<null> = { success: false, message, data: null }
  return res.status(statusCode).json(body)
}
