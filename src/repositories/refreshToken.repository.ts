import { prisma } from '../database/prisma.js'

export class RefreshTokenRepository {
  async create(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    })
  }

  async findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })
  }

  async revoke(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    })
  }

  async revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    })
  }

  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  }
}

export const refreshTokenRepository = new RefreshTokenRepository()
