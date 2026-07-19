import {
  alpacaMarketDataService,
  type ListAssetsParams,
} from '../integrations/alpaca/marketData.service.js'

export class MarketService {
  async listAssets(params?: ListAssetsParams) {
    return alpacaMarketDataService.listAssets(params)
  }

  async searchSymbols(
    query?: string,
    status?: ListAssetsParams['status'],
    assetClass?: string
  ) {
    return alpacaMarketDataService.searchSymbols(query, status, assetClass)
  }

  async getAssetDetails(symbol: string) {
    return alpacaMarketDataService.getAssetDetails(symbol)
  }

  async getLatestQuote(symbol: string) {
    return alpacaMarketDataService.getLatestQuote(symbol)
  }

  async getLatestTrade(symbol: string) {
    return alpacaMarketDataService.getLatestTrade(symbol)
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
    return alpacaMarketDataService.getHistoricalBars(symbol, params)
  }
}

export const marketService = new MarketService()
