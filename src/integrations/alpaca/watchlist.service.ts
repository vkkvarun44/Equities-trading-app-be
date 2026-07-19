import { alpacaBrokerClient } from './client.js'

export class AlpacaWatchlistService {
  async getWatchlists(accountId: string) {
    const { data } = await alpacaBrokerClient.get(
      `/v1/trading/accounts/${accountId}/watchlists`
    )
    return data
  }

  async getWatchlist(accountId: string, watchlistId: string) {
    const { data } = await alpacaBrokerClient.get(
      `/v1/trading/accounts/${accountId}/watchlists/${watchlistId}`
    )
    return data
  }

  async createWatchlist(accountId: string, name: string, symbols: string[] = []) {
    const { data } = await alpacaBrokerClient.post(
      `/v1/trading/accounts/${accountId}/watchlists`,
      { name, symbols }
    )
    return data
  }

  async updateWatchlist(accountId: string, watchlistId: string, name: string, symbols: string[]) {
    const { data } = await alpacaBrokerClient.put(
      `/v1/trading/accounts/${accountId}/watchlists/${watchlistId}`,
      { name, symbols }
    )
    return data
  }

  async deleteWatchlist(accountId: string, watchlistId: string) {
    await alpacaBrokerClient.delete(
      `/v1/trading/accounts/${accountId}/watchlists/${watchlistId}`
    )
  }

  async addAssetToWatchlist(accountId: string, watchlistId: string, symbol: string) {
    const { data } = await alpacaBrokerClient.post(
      `/v1/trading/accounts/${accountId}/watchlists/${watchlistId}`,
      { symbol }
    )
    return data
  }

  async removeAssetFromWatchlist(accountId: string, watchlistId: string, symbol: string) {
    await alpacaBrokerClient.delete(
      `/v1/trading/accounts/${accountId}/watchlists/${watchlistId}/${symbol}`
    )
  }
}

export const alpacaWatchlistService = new AlpacaWatchlistService()
