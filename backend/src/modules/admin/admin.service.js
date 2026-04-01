import { prisma } from '../../db/client.js'
import { AppError } from '../../middleware/errorHandler.js'
import { appendOrderEvent } from '../../services/eventService.js'
import { publishOrderEvent } from '../../services/sseRegistry.js'
import { serializeOrder } from '../../utils/serializers.js'

const ACTIVE_ORDER_FILTER = {
  OR: [{ status: 'Assigned', acceptedAt: { not: null } }, { status: { in: ['PickedUp', 'OnTheWay'] } }],
}

function presentDriverStatus(driverId, activeOrderDriverIds, isAvailable) {
  if (activeOrderDriverIds.has(driverId)) return 'On Delivery'
  return isAvailable ? 'Online' : 'Offline'
}

function statusSortValue(status) {
  if (status === 'Online') return 0
  if (status === 'On Delivery') return 1
  return 2
}

export async function listAdminOrders() {
  const orders = await prisma.order.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { include: { user: { select: { id: true, name: true, role: true } } } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map((order) => ({
    ...serializeOrder(order),
    customerName: order.customer?.name || null,
    driverName: order.driver?.user?.name || null,
  }))
}

export async function getAdminOrderById(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { include: { user: { select: { id: true, name: true, role: true } } } },
      payments: { orderBy: { createdAt: 'desc' } },
      events: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) throw new AppError('Order not found', 404)

  return {
    ...serializeOrder(order),
    customerName: order.customer?.name || null,
    driverName: order.driver?.user?.name || null,
  }
}

export async function assignOrderByAdmin(orderId, actorUserId, driverId) {
  const [order, driver] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId } }),
    prisma.driver.findUnique({ where: { id: driverId }, include: { user: { select: { name: true } } } }),
  ])

  if (!order) throw new AppError('Order not found', 404)
  if (!driver) throw new AppError('Driver not found', 404)
  if (order.status === 'Delivered') throw new AppError('Delivered orders are read-only', 400)

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.order.update({
      where: { id: order.id },
      data: {
        driverId: driver.id,
        status: 'Assigned',
        assignedAt: new Date(),
        acceptedAt: null,
        rejectedAt: null,
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        driver: { include: { user: { select: { id: true, name: true, role: true } } } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    })

    await tx.driver.update({ where: { id: driver.id }, data: { isAvailable: true } })

    await appendOrderEvent(tx, {
      orderId: order.id,
      actorUserId,
      eventType: 'DRIVER_ASSIGNED',
      payload: { driverId: driver.id, driverName: driver.user?.name || null, mode: 'admin' },
    })

    return row
  })

  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: 'Assigned',
    paymentStatus: updated.paymentStatus,
    timestamp: new Date().toISOString(),
  })

  return {
    ...serializeOrder(updated),
    customerName: updated.customer?.name || null,
    driverName: updated.driver?.user?.name || null,
  }
}

export async function listAdminDrivers() {
  const [drivers, activeOrders] = await Promise.all([
    prisma.driver.findMany({
      include: { user: { select: { id: true, name: true, role: true } } },
    }),
    prisma.order.findMany({
      where: ACTIVE_ORDER_FILTER,
      select: { id: true, driverId: true },
    }),
  ])

  const activeOrderDriverIds = new Set(activeOrders.map((order) => order.driverId).filter(Boolean))
  const activeCountByDriver = activeOrders.reduce((acc, order) => {
    if (!order.driverId) return acc
    acc[order.driverId] = (acc[order.driverId] || 0) + 1
    return acc
  }, {})

  const rows = drivers.map((driver) => {
    const status = presentDriverStatus(driver.id, activeOrderDriverIds, driver.isAvailable)
    const activityTime = driver.lastSeenAt || driver.updatedAt

    return {
      id: driver.id,
      userId: driver.userId,
      name: driver.user?.name || 'Unknown',
      role: driver.user?.role || 'driver',
      phone: driver.phone,
      status,
      activeDeliveries: activeCountByDriver[driver.id] || 0,
      lastSeenAt: driver.lastSeenAt,
      updatedAt: driver.updatedAt,
      _activityTime: activityTime ? new Date(activityTime).getTime() : 0,
    }
  })

  rows.sort((a, b) => {
    const statusDiff = statusSortValue(a.status) - statusSortValue(b.status)
    if (statusDiff !== 0) return statusDiff

    const activityDiff = b._activityTime - a._activityTime
    if (activityDiff !== 0) return activityDiff

    return a.name.localeCompare(b.name)
  })

  return rows.map(({ _activityTime, ...driver }) => driver)
}

export async function getAdminDriverById(driverId) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      user: { select: { id: true, name: true, role: true } },
      orders: {
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          customer: { select: { id: true, name: true } },
          payments: { orderBy: { createdAt: 'desc' } },
        },
      },
    },
  })

  if (!driver) throw new AppError('Driver not found', 404)

  const activeOrders = driver.orders.filter((order) => (order.status === 'Assigned' && order.acceptedAt) || ['PickedUp', 'OnTheWay'].includes(order.status))
  const status = activeOrders.length > 0 ? 'On Delivery' : driver.isAvailable ? 'Online' : 'Offline'

  return {
    id: driver.id,
    userId: driver.userId,
    name: driver.user?.name || 'Unknown',
    role: driver.user?.role || 'driver',
    phone: driver.phone,
    status,
    activeDeliveries: activeOrders.length,
    lastSeenAt: driver.lastSeenAt,
    updatedAt: driver.updatedAt,
    recentOrders: driver.orders.map((order) => serializeOrder(order)),
  }
}
