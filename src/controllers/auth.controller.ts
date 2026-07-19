import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import { sendSuccess } from '../utils/response.js'

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body)
  sendSuccess(res, result, 'Registration successful', 201)
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body
  const result = await authService.login(email, password)
  sendSuccess(res, result, 'Login successful')
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body
  const result = await authService.refresh(refreshToken)
  sendSuccess(res, result, 'Token refreshed')
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body
  await authService.logout(refreshToken)
  sendSuccess(res, null, 'Logged out successfully')
}
