import type { Request, Response } from 'express'
import { alpacaAuthService } from '../integrations/alpaca/auth.service.js'
import { sendSuccess } from '../utils/response.js'

export async function getAlpacaToken(_req: Request, res: Response): Promise<void> {
  const token = await alpacaAuthService.getTokenDetails()
  sendSuccess(res, token, 'Alpaca access token issued')
}
