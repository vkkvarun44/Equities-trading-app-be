import { userRepository } from '../repositories/user.repository.js'
import { NotFoundError } from '../utils/errors.js'
import type { SafeUser } from '../types/index.js'

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

export class UserService {
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('User not found')
    return toSafeUser(user)
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string | null }
  ): Promise<SafeUser> {
    const user = await userRepository.update(userId, data)
    return toSafeUser(user)
  }
}

export const userService = new UserService()
