import type { Request, Response } from 'express'
import { marketService } from '../services/market.service.js'
import { sendSuccess } from '../utils/response.js'
import { param } from '../utils/params.js'
import type { ListAssetsParams } from '../integrations/alpaca/marketData.service.js'

export async function listAssets(req: Request, res: Response): Promise<void> {
  const { status, asset_class } = req.query as ListAssetsParams
  const assets = await marketService.listAssets({ status, asset_class })
  sendSuccess(res, assets, 'Assets retrieved')
}

export async function searchSymbols(req: Request, res: Response): Promise<void> {
  const { q, status, asset_class } = req.query as {
    q?: string
    status?: ListAssetsParams['status']
    asset_class?: string
  }
  const results = await marketService.searchSymbols(q, status, asset_class)
  sendSuccess(res, results)
}

export async function getAssetDetails(req: Request, res: Response): Promise<void> {
  const asset = await marketService.getAssetDetails(param(req.params.symbol, 'symbol'))
  sendSuccess(res, asset)
}

export async function getLatestQuote(req: Request, res: Response): Promise<void> {
  const quote = await marketService.getLatestQuote(param(req.params.symbol, 'symbol'))
  sendSuccess(res, quote)
}

export async function getLatestTrade(req: Request, res: Response): Promise<void> {
  const trade = await marketService.getLatestTrade(param(req.params.symbol, 'symbol'))
  sendSuccess(res, trade)
}

export async function getHistoricalBars(req: Request, res: Response): Promise<void> {
  const bars = await marketService.getHistoricalBars(param(req.params.symbol, 'symbol'), req.query as never)
  sendSuccess(res, bars)
}
