import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/auth.js'
import { loginSchema, refreshSchema, registerSchema } from './auth.validation.js'
import * as controller from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', validate(registerSchema), asyncHandler(controller.register))
authRouter.post('/login', validate(loginSchema), asyncHandler(controller.login))
authRouter.post('/refresh', validate(refreshSchema), asyncHandler(controller.refresh))
authRouter.post('/logout', asyncHandler(controller.logout))
authRouter.get('/me', authenticate, asyncHandler(controller.me))
