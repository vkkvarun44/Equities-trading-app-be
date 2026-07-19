import type { Request, Response } from 'express'
import { brokerService } from '../services/broker.service.js'
import { sendSuccess } from '../utils/response.js'
import { AuthenticationError } from '../utils/errors.js'
import { param } from '../utils/params.js'

export async function createAccount(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const account = await brokerService.createAccount(req.user.id, req.body)
  sendSuccess(res, account, 'Account created', 201)
}

export async function getAccount(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const account = await brokerService.getAccount(req.user.id, param(req.params.accountId, 'accountId'))
  sendSuccess(res, account)
}

export async function listAccounts(req: Request, res: Response): Promise<void> {
  const accounts = await brokerService.listAccounts(req.query as Record<string, string>)
  sendSuccess(res, accounts)
}

export async function getPortfolio(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const portfolio = await brokerService.getPortfolio(req.user.id)
  sendSuccess(res, portfolio)
}

export async function getPositions(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const positions = await brokerService.getPositions(req.user.id)
  sendSuccess(res, positions)
}

export async function getOrders(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const orders = await brokerService.getOrders(req.user.id, req.query as never)
  sendSuccess(res, orders)
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const order = await brokerService.createOrder(req.user.id, req.body)
  sendSuccess(res, order, 'Order created', 201)
}

export async function cancelOrder(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  await brokerService.cancelOrder(req.user.id, param(req.params.orderId, 'orderId'))
  sendSuccess(res, null, 'Order cancelled')
}

export async function getWatchlists(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const watchlists = await brokerService.getWatchlists(req.user.id)
  sendSuccess(res, watchlists)
}

export async function createWatchlist(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const { name, symbols } = req.body
  const watchlist = await brokerService.createWatchlist(req.user.id, name, symbols)
  sendSuccess(res, watchlist, 'Watchlist created', 201)
}

export async function addAssetToWatchlist(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  const watchlist = await brokerService.addAssetToWatchlist(
    req.user.id,
    param(req.params.watchlistId, 'watchlistId'),
    req.body.symbol
  )
  sendSuccess(res, watchlist, 'Asset added to watchlist')
}

export async function removeAssetFromWatchlist(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AuthenticationError()
  await brokerService.removeAssetFromWatchlist(
    req.user.id,
    param(req.params.watchlistId, 'watchlistId'),
    param(req.params.symbol, 'symbol')
  )
  sendSuccess(res, null, 'Asset removed from watchlist')
}
