import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { isRedisAvailable, redis } from '../config/redis.js'
import { userRepository } from '../repositories/user.repository.js'
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js'
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js'
import type { AuthTokens, JwtPayload, SafeUser } from '../types/index.js'

const SALT_ROUNDS = 12
const BLACKLIST_PREFIX = 'token:blacklist:'

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 60 * 60

  const value = parseInt(match[1]!, 10)
  const unit = match[2]!

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  }

  return value * (multipliers[unit] ?? 86400)
}

function toSafeUser(user: {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  alpacaAccountId: string | null
  createdAt: Date
  updatedAt: Date
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    alpacaAccountId: user.alpacaAccountId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export class AuthService {
  private signAccessToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email, type: 'access' }
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    })
  }

  private signRefreshToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email, type: 'refresh' }
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    })
  }

  private async generateTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = this.signAccessToken(userId, email)
    const refreshToken = this.signRefreshToken(userId, email)

    const expiresAt = new Date(
      Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRES_IN) * 1000
    )
    await refreshTokenRepository.create(userId, refreshToken, expiresAt)

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    }
  }

  async register(input: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) {
    const existing = await userRepository.findByEmail(input.email.toLowerCase())
    if (existing) {
      throw new ConflictError('Email already registered')
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)
    const user = await userRepository.create({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    })

    const tokens = await this.generateTokens(user.id, user.email)

    return { user: toSafeUser(user), tokens }
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email.toLowerCase())
    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid email or password')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AuthenticationError('Invalid email or password')
    }

    const tokens = await this.generateTokens(user.id, user.email)
    return { user: toSafeUser(user), tokens }
  }

  async refresh(refreshToken: string) {
    if (isRedisAvailable()) {
      const blacklisted = await redis.get(`${BLACKLIST_PREFIX}${refreshToken}`)
      if (blacklisted) {
        throw new AuthenticationError('Token has been revoked')
      }
    }

    let decoded: JwtPayload
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token')
    }

    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type')
    }

    const stored = await refreshTokenRepository.findByToken(refreshToken)
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid or expired refresh token')
    }

    await refreshTokenRepository.revoke(refreshToken)

    const user = await userRepository.findById(decoded.sub)
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found')
    }

    const tokens = await this.generateTokens(user.id, user.email)
    return { user: toSafeUser(user), tokens }
  }

  async logout(refreshToken: string) {
    await refreshTokenRepository.revoke(refreshToken)

    if (isRedisAvailable()) {
      const ttl = parseExpiry(env.JWT_REFRESH_EXPIRES_IN)
      await redis.setex(`${BLACKLIST_PREFIX}${refreshToken}`, ttl, '1')
    }
  }
}

export const authService = new AuthService()
