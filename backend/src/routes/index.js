import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { ordersRouter } from '../modules/orders/orders.routes.js'
import { driverRouter } from '../modules/drivers/driver.routes.js'
import { trackingRouter } from '../modules/tracking/tracking.routes.js'
import { paymentsRouter } from '../modules/payments/payments.routes.js'
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js'
import { adminRouter } from '../modules/admin/admin.routes.js'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/orders', ordersRouter)
apiRouter.use('/driver', driverRouter)
apiRouter.use('/tracking', trackingRouter)
apiRouter.use('/payments', paymentsRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/admin', adminRouter)
