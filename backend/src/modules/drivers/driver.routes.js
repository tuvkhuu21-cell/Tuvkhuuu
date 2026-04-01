import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { authenticate, authorize } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { driverAvailabilitySchema, driverLocationSchema, driverStatusSchema } from './driver.validation.js'
import * as controller from './driver.controller.js'

export const driverRouter = Router()

driverRouter.use(authenticate, authorize('driver'))
driverRouter.get('/me', asyncHandler(controller.getProfile))
driverRouter.get('/assigned-orders', asyncHandler(controller.getAssignedOrders))
driverRouter.get('/active-order', asyncHandler(controller.getActiveOrder))
driverRouter.get('/completed-orders', asyncHandler(controller.getCompletedOrders))
driverRouter.get('/orders/:id', asyncHandler(controller.getOrderById))
driverRouter.post('/orders/:id/accept', asyncHandler(controller.acceptOrder))
driverRouter.post('/orders/:id/reject', asyncHandler(controller.rejectOrder))
driverRouter.post('/orders/:id/status', validate(driverStatusSchema), asyncHandler(controller.updateOrderStatus))
driverRouter.post('/status', validate(driverAvailabilitySchema), asyncHandler(controller.updateAvailability))
driverRouter.post('/location', validate(driverLocationSchema), asyncHandler(controller.updateLocation))
