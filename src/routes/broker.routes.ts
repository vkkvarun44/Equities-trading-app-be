import { Router } from 'express'
import * as brokerController from '../controllers/broker.controller.js'
import { authenticate, requireAlpacaAccount } from '../middleware/auth.middleware.js'
import { alpacaTokenContext } from '../middleware/alpacaToken.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  accountIdParamSchema,
  createAccountSchema,
  listAccountsQuerySchema,
  createOrderSchema,
  orderIdParamSchema,
  listOrdersQuerySchema,
  createWatchlistSchema,
  watchlistIdParamSchema,
  addAssetSchema,
  symbolParamSchema,
} from '../validators/broker.validator.js'

const router = Router()

router.use(alpacaTokenContext)
router.use(authenticate)

router.post('/accounts', validate(createAccountSchema), asyncHandler(brokerController.createAccount))
router.get('/accounts', validate(listAccountsQuerySchema, 'query'), asyncHandler(brokerController.listAccounts))
router.get(
  '/accounts/:accountId',
  validate(accountIdParamSchema, 'params'),
  asyncHandler(brokerController.getAccount)
)

router.get('/portfolio', requireAlpacaAccount, asyncHandler(brokerController.getPortfolio))
router.get('/positions', requireAlpacaAccount, asyncHandler(brokerController.getPositions))

router.get(
  '/orders',
  requireAlpacaAccount,
  validate(listOrdersQuerySchema, 'query'),
  asyncHandler(brokerController.getOrders)
)
router.post(
  '/orders',
  requireAlpacaAccount,
  validate(createOrderSchema),
  asyncHandler(brokerController.createOrder)
)
router.delete(
  '/orders/:orderId',
  requireAlpacaAccount,
  validate(orderIdParamSchema, 'params'),
  asyncHandler(brokerController.cancelOrder)
)

router.get('/watchlists', requireAlpacaAccount, asyncHandler(brokerController.getWatchlists))
router.post(
  '/watchlists',
  requireAlpacaAccount,
  validate(createWatchlistSchema),
  asyncHandler(brokerController.createWatchlist)
)
router.post(
  '/watchlists/:watchlistId/assets',
  requireAlpacaAccount,
  validate(watchlistIdParamSchema, 'params'),
  validate(addAssetSchema),
  asyncHandler(brokerController.addAssetToWatchlist)
)
router.delete(
  '/watchlists/:watchlistId/assets/:symbol',
  requireAlpacaAccount,
  validate(watchlistIdParamSchema, 'params'),
  validate(symbolParamSchema, 'params'),
  asyncHandler(brokerController.removeAssetFromWatchlist)
)

export default router
