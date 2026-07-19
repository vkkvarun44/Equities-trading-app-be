import { alpacaBrokerClient } from './client.js'

export interface CreateOrderPayload {
  symbol: string
  qty?: string
  notional?: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop'
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok'
  limit_price?: string
  stop_price?: string
  trail_price?: string
  trail_percent?: string
  extended_hours?: boolean
  client_order_id?: string
  order_class?: 'simple' | 'bracket' | 'oco' | 'oto'
  commission?: string
}

export class AlpacaTradingService {
  async getPortfolio(accountId: string) {
    const { data } = await alpacaBrokerClient.get(`/v1/trading/accounts/${accountId}/account`)
    return data
  }

  async getPositions(accountId: string) {
    const { data } = await alpacaBrokerClient.get(`/v1/trading/accounts/${accountId}/positions`)
    return data
  }

  async getPosition(accountId: string, symbol: string) {
    const { data } = await alpacaBrokerClient.get(
      `/v1/trading/accounts/${accountId}/positions/${symbol}`
    )
    return data
  }

  async getOrders(
    accountId: string,
    params?: {
      status?: string
      limit?: number
      after?: string
      until?: string
      direction?: 'asc' | 'desc'
      nested?: boolean
      symbols?: string
    }
  ) {
    const { data } = await alpacaBrokerClient.get(`/v1/trading/accounts/${accountId}/orders`, {
      params,
    })
    return data
  }

  async getOrder(accountId: string, orderId: string) {
    const { data } = await alpacaBrokerClient.get(
      `/v1/trading/accounts/${accountId}/orders/${orderId}`
    )
    return data
  }

  async createOrder(accountId: string, payload: CreateOrderPayload) {
    const { data } = await alpacaBrokerClient.post(
      `/v1/trading/accounts/${accountId}/orders`,
      payload
    )
    return data
  }

  async cancelOrder(accountId: string, orderId: string) {
    await alpacaBrokerClient.delete(`/v1/trading/accounts/${accountId}/orders/${orderId}`)
  }

  async cancelAllOrders(accountId: string) {
    const { data } = await alpacaBrokerClient.delete(
      `/v1/trading/accounts/${accountId}/orders`
    )
    return data
  }
}

export const alpacaTradingService = new AlpacaTradingService()
