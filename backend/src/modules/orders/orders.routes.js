import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { authenticate, authorize } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { assignOrderSchema, createOrderSchema, updateOrderStatusSchema } from './orders.validation.js'
import * as controller from './orders.controller.js'

export const ordersRouter = Router()

ordersRouter.get('/', authenticate, asyncHandler(controller.listOrders))
ordersRouter.post('/', authenticate, authorize('customer'), validate(createOrderSchema), asyncHandler(controller.createOrder))
ordersRouter.get('/:id', authenticate, asyncHandler(controller.getOrderById))
ordersRouter.get('/:id/timeline', authenticate, asyncHandler(controller.getTimeline))
ordersRouter.post('/:id/assign', authenticate, authorize('manager', 'admin'), validate(assignOrderSchema), asyncHandler(controller.assignOrder))
ordersRouter.post('/:id/status', authenticate, authorize('manager', 'admin'), validate(updateOrderStatusSchema), asyncHandler(controller.updateOrderStatus))
