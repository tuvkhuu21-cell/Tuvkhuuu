import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { authenticate, authorize } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { confirmPaymentSchema, createIntentSchema, refundSchema } from './payments.validation.js'
import * as controller from './payments.controller.js'

export const paymentsRouter = Router()

paymentsRouter.post('/webhook', asyncHandler(controller.webhook))
paymentsRouter.post('/create-intent', authenticate, validate(createIntentSchema), asyncHandler(controller.createIntent))
paymentsRouter.post('/confirm', authenticate, validate(confirmPaymentSchema), asyncHandler(controller.confirm))
paymentsRouter.get('/history/:orderId', authenticate, asyncHandler(controller.getHistory))
paymentsRouter.get('/:orderId', authenticate, asyncHandler(controller.getByOrder))
paymentsRouter.post('/:orderId/mark-cod', authenticate, authorize('manager', 'admin'), asyncHandler(controller.markCod))
paymentsRouter.post('/:orderId/refund', authenticate, authorize('manager', 'admin'), validate(refundSchema), asyncHandler(controller.refund))
