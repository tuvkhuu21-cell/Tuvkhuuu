import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as controller from './dashboard.controller.js'

export const dashboardRouter = Router()

dashboardRouter.use(authenticate, authorize('manager', 'admin'))
dashboardRouter.get('/summary', asyncHandler(controller.getSummary))
dashboardRouter.get('/daily-stats', asyncHandler(controller.getDailyStats))
dashboardRouter.get('/delays', asyncHandler(controller.getDelays))
dashboardRouter.get('/active-deliveries', asyncHandler(controller.getActiveDeliveries))
dashboardRouter.get('/payment-summary', asyncHandler(controller.getPaymentSummary))
dashboardRouter.get('/driver-availability', asyncHandler(controller.getDriverAvailability))
