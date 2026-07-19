import { Router } from 'express'
import { healthCheck } from '../controllers/health.controller.js'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import brokerRoutes from './broker.routes.js'
import marketRoutes from './market.routes.js'
import alpacaRoutes from './alpaca.routes.js'

const router = Router()

router.get('/health', healthCheck)
router.use('/alpaca', alpacaRoutes)
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/broker', brokerRoutes)
router.use('/market', marketRoutes)

export default router
