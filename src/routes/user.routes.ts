import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { updateProfileSchema } from '../validators/user.validator.js'

const router = Router()

router.use(authenticate)

router.get('/profile', asyncHandler(userController.getProfile))
router.patch('/profile', validate(updateProfileSchema), asyncHandler(userController.updateProfile))

export default router
