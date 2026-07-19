import { Router } from 'express'
import * as alpacaController from '../controllers/alpaca.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/token', asyncHandler(alpacaController.getAlpacaToken))

export default router
