import type { Request, Response } from 'express'
import { userService } from '../services/user.service.js'
import { sendSuccess } from '../utils/response.js'
import { AuthenticationError } from '../utils/errors.js'

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const profile = await userService.getProfile(req.user.id)
  sendSuccess(res, profile)
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const profile = await userService.updateProfile(req.user.id, req.body)
  sendSuccess(res, profile, 'Profile updated')
}
