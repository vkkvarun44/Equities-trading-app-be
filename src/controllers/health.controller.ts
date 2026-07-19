import type { Request, Response } from 'express'
import { sendSuccess } from '../utils/response.js'

export function healthCheck(_req: Request, res: Response): void {
  sendSuccess(res, { status: 'healthy' })
}
