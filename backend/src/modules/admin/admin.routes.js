import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { authenticate, authorize } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { adminAssignOrderSchema } from './admin.validation.js'
import * as controller from './admin.controller.js'

export const adminRouter = Router()

adminRouter.use(authenticate, authorize('admin'))
adminRouter.get('/orders', asyncHandler(controller.listOrders))
adminRouter.get('/orders/:id', asyncHandler(controller.getOrderById))
adminRouter.post('/orders/:id/assign', validate(adminAssignOrderSchema), asyncHandler(controller.assignOrder))
adminRouter.get('/drivers', asyncHandler(controller.listDrivers))
adminRouter.get('/drivers/:id', asyncHandler(controller.getDriverById))
