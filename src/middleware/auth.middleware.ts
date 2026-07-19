import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userRepository } from '../repositories/user.repository.js'
import { AuthenticationError, AuthorizationError } from '../utils/errors.js'
import type { JwtPayload } from '../types/index.js'

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload

    if (decoded.type !== 'access') {
      throw new AuthenticationError('Invalid token type')
    }

    const user = await userRepository.findById(decoded.sub)
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive')
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      alpacaAccountId: user.alpacaAccountId,
    }

    next()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error)
      return
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid or expired token'))
      return
    }
    next(error)
  }
}

export function requireAlpacaAccount(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.alpacaAccountId) {
    next(new AuthorizationError('Alpaca brokerage account required. Please complete account setup.'))
    return
  }
  next()
}
