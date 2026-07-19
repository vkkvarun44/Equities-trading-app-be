import { Router } from 'express'
import * as marketController from '../controllers/market.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { alpacaTokenContext } from '../middleware/alpacaToken.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  listAssetsQuerySchema,
  searchSymbolQuerySchema,
  symbolParamSchema,
  historicalBarsQuerySchema,
} from '../validators/market.validator.js'

const router = Router()

router.use(alpacaTokenContext)

// Public — mirrors Alpaca GET /v1/assets; no JWT or brokerage account required
router.get(
  '/assets',
  validate(listAssetsQuerySchema, 'query'),
  asyncHandler(marketController.listAssets)
)

router.use(authenticate)

router.get('/search', validate(searchSymbolQuerySchema, 'query'), asyncHandler(marketController.searchSymbols))
router.get(
  '/assets/:symbol',
  validate(symbolParamSchema, 'params'),
  asyncHandler(marketController.getAssetDetails)
)
router.get(
  '/quotes/:symbol/latest',
  validate(symbolParamSchema, 'params'),
  asyncHandler(marketController.getLatestQuote)
)
router.get(
  '/trades/:symbol/latest',
  validate(symbolParamSchema, 'params'),
  asyncHandler(marketController.getLatestTrade)
)
router.get(
  '/bars/:symbol',
  validate(symbolParamSchema, 'params'),
  validate(historicalBarsQuerySchema, 'query'),
  asyncHandler(marketController.getHistoricalBars)
)

export default router
