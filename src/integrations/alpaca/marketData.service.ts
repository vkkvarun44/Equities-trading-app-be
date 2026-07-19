import { alpacaBrokerClient, alpacaDataClient } from './client.js'

export interface ListAssetsParams {
  status?: 'active' | 'inactive'
  asset_class?: string
}

export class AlpacaMarketDataService {
  /**
   * Alpaca's recommended first API call — no request body or brokerage account required.
   * @see https://docs.alpaca.markets/docs/getting-started-with-broker-api
   */
  async listAssets(params?: ListAssetsParams) {
    const { data } = await alpacaBrokerClient.get('/v1/assets', {
      params: params ?? {},
    })
    return data
  }

  async searchSymbols(
    query?: string,
    status: ListAssetsParams['status'] = 'active',
    assetClass = 'us_equity'
  ) {
    const assets = await this.listAssets({ status, asset_class: assetClass })

    if (!query) return assets

    const normalizedQuery = query.toUpperCase()
    return (assets as Array<{ symbol: string; name: string }>).filter(
      (asset) =>
        asset.symbol.includes(normalizedQuery) ||
        asset.name.toUpperCase().includes(normalizedQuery)
    )
  }

  async getAssetDetails(symbol: string) {
    const { data } = await alpacaBrokerClient.get(`/v1/assets/${symbol}`)
    return data
  }

  async getLatestQuote(symbol: string) {
    const { data } = await alpacaDataClient.get(`/v2/stocks/${symbol}/quotes/latest`)
    return data
  }

  async getLatestTrade(symbol: string) {
    const { data } = await alpacaDataClient.get(`/v2/stocks/${symbol}/trades/latest`)
    return data
  }

  async getHistoricalBars(
    symbol: string,
    params: {
      timeframe: string
      start?: string
      end?: string
      limit?: number
      adjustment?: 'raw' | 'split' | 'dividend' | 'all'
      feed?: 'iex' | 'sip'
    }
  ) {
    const { data } = await alpacaDataClient.get(`/v2/stocks/${symbol}/bars`, { params })
    return data
  }
}

export const alpacaMarketDataService = new AlpacaMarketDataService()
