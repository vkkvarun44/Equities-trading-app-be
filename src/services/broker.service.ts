import {
  alpacaAccountService,
  alpacaTradingService,
  alpacaWatchlistService,
} from '../integrations/alpaca/index.js'
import type { CreateAlpacaAccountPayload } from '../integrations/alpaca/account.service.js'
import type { CreateOrderPayload } from '../integrations/alpaca/trading.service.js'
import { userRepository } from '../repositories/user.repository.js'
import { AuthorizationError } from '../utils/errors.js'

export class BrokerService {
  private async resolveAccountId(userId: string, accountId?: string): Promise<string> {
    const user = await userRepository.findById(userId)
    if (!user?.alpacaAccountId) {
      throw new AuthorizationError('No Alpaca account linked to this user')
    }

    if (accountId && accountId !== user.alpacaAccountId) {
      throw new AuthorizationError('Access denied to this account')
    }

    return user.alpacaAccountId
  }

  async createAccount(userId: string, payload: CreateAlpacaAccountPayload) {
    const account = await alpacaAccountService.createAccount(payload)

    if (account?.id) {
      await userRepository.update(userId, { alpacaAccountId: account.id })
    }

    return account
  }

  async getAccount(userId: string, accountId: string) {
    const resolvedId = await this.resolveAccountId(userId, accountId)
    return alpacaAccountService.getAccount(resolvedId)
  }

  async listAccounts(params?: { query?: string; created_after?: string; created_before?: string }) {
    return alpacaAccountService.listAccounts(params)
  }

  async getPortfolio(userId: string) {
    const accountId = await this.resolveAccountId(userId)
    return alpacaTradingService.getPortfolio(accountId)
  }

  async getPositions(userId: string) {
    const accountId = await this.resolveAccountId(userId)
    return alpacaTradingService.getPositions(accountId)
  }

  async getOrders(
    userId: string,
    params?: {
      status?: string
      limit?: number
      after?: string
      until?: string
      direction?: 'asc' | 'desc'
      symbols?: string
    }
  ) {
    const accountId = await this.resolveAccountId(userId)
    return alpacaTradingService.getOrders(accountId, params)
  }

  async createOrder(userId: string, payload: CreateOrderPayload) {
    const accountId = await this.resolveAccountId(userId)
    return alpacaTradingService.createOrder(accountId, payload)
  }

  async cancelOrder(userId: string, orderId: string) {
    const accountId = await this.resolveAccountId(userId)
    await alpacaTradingService.cancelOrder(accountId, orderId)
  }

  async getWatchlists(userId: string) {
    const accountId = await this.resolveAccountId(userId)
    return alpacaWatchlistService.getWatchlists(accountId)
  }

  async createWatchlist(userId: string, name: string, symbols: string[] = []) {
    const accountId = await this.resolveAccountId(userId)
    return alpacaWatchlistService.createWatchlist(accountId, name, symbols)
  }

  async addAssetToWatchlist(userId: string, watchlistId: string, symbol: string) {
    const accountId = await this.resolveAccountId(userId)
    return alpacaWatchlistService.addAssetToWatchlist(accountId, watchlistId, symbol)
  }

  async removeAssetFromWatchlist(userId: string, watchlistId: string, symbol: string) {
    const accountId = await this.resolveAccountId(userId)
    await alpacaWatchlistService.removeAssetFromWatchlist(accountId, watchlistId, symbol)
  }
}

export const brokerService = new BrokerService()
