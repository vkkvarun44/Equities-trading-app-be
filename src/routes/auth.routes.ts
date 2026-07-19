import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../validators/auth.validator.js'

const router = Router()

router.post('/register', validate(registerSchema), asyncHandler(authController.register))
router.post('/login', validate(loginSchema), asyncHandler(authController.login))
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(authController.refresh))
router.post('/logout', validate(logoutSchema), asyncHandler(authController.logout))

export default router
