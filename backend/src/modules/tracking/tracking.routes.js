import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as controller from './tracking.controller.js'

export const trackingRouter = Router()

trackingRouter.get('/:orderId', authenticate, asyncHandler(controller.getTracking))
trackingRouter.get('/:orderId/stream', authenticate, asyncHandler(controller.streamTracking))
