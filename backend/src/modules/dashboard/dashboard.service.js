import { prisma } from '../../db/client.js'
import { env } from '../../config/env.js'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function getSummary() {
  const today = startOfToday()

  const [deliveriesToday, activeDeliveries, paymentAgg] = await Promise.all([
    prisma.order.count({ where: { status: 'Delivered', deliveredAt: { gte: today } } }),
    prisma.order.count({ where: { status: { in: ['Assigned', 'PickedUp', 'OnTheWay'] } } }),
    prisma.payment.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
  ])

  return {
    deliveriesToday,
    activeDeliveries,
    paymentByStatus: paymentAgg,
  }
}

export async function getDailyStats() {
  return prisma.$queryRaw`
    SELECT
      DATE(created_at) as day,
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    LIMIT 14
  `
}

export async function getDelays() {
  const thresholdMinutes = env.DELAY_THRESHOLD_MINUTES

  const delayedDelivered = await prisma.$queryRaw`
    SELECT
      id,
      status,
      estimated_minutes,
      TIMESTAMPDIFF(MINUTE, assigned_at, delivered_at) AS duration_minutes
    FROM orders
    WHERE status = 'Delivered'
      AND assigned_at IS NOT NULL
      AND delivered_at IS NOT NULL
      AND estimated_minutes IS NOT NULL
      AND TIMESTAMPDIFF(MINUTE, assigned_at, delivered_at) > estimated_minutes
    ORDER BY delivered_at DESC
    LIMIT 50
  `

  const delayedActive = await prisma.$queryRaw`
    SELECT
      id,
      status,
      estimated_minutes,
      TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS age_minutes
    FROM orders
    WHERE status IN ('Assigned', 'Picked Up', 'On The Way')
      AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > ${thresholdMinutes}
    ORDER BY created_at ASC
    LIMIT 50
  `

  return {
    delayedDelivered,
    delayedActive,
    totalDelayed: delayedDelivered.length + delayedActive.length,
  }
}

export async function getActiveDeliveries() {
  return prisma.order.findMany({
    where: { status: { in: ['Assigned', 'PickedUp', 'OnTheWay'] } },
    include: {
      customer: { select: { id: true, name: true } },
      driver: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getPaymentSummary() {
  const [totalsByStatus, totalsByMethod, refundedCount] = await Promise.all([
    prisma.payment.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['paymentMethod'],
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: 'Refunded' } }),
  ])

  return {
    totalsByStatus,
    totalsByMethod,
    refundedCount,
  }
}

export async function getDriverAvailabilityList() {
  const [drivers, activeOrders] = await Promise.all([
    prisma.driver.findMany({
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { status: 'Assigned', acceptedAt: { not: null } },
          { status: { in: ['PickedUp', 'OnTheWay'] } },
        ],
      },
      select: { id: true, driverId: true },
    }),
  ])

  const activeOrderByDriver = new Map(activeOrders.filter((order) => order.driverId).map((order) => [order.driverId, order.id]))

  return drivers.map((driver) => ({
    driverId: driver.id,
    userId: driver.userId,
    name: driver.user?.name || 'Unknown',
    role: driver.user?.role || 'driver',
    status: activeOrderByDriver.has(driver.id) ? 'On Delivery' : driver.isAvailable ? 'Online' : 'Offline',
    activeOrderId: activeOrderByDriver.get(driver.id) || null,
    isAvailable: driver.isAvailable,
    updatedAt: driver.updatedAt,
  }))
}
