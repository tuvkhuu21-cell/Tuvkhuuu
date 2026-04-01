import { prisma } from '../../db/client.js'
import { AppError } from '../../middleware/errorHandler.js'
import { presentOrderStatus, presentPaymentStatus } from '../../utils/statusMaps.js'
import { subscribeOrder, unsubscribeOrder } from '../../services/sseRegistry.js'

export async function getTrackingSnapshot(orderId, user) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      driver: { include: { user: true } },
      driverLocations: { orderBy: { recordedAt: 'desc' }, take: 1 },
    },
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  if (user.role === 'customer' && order.customerId !== user.id) {
    throw new AppError('Forbidden', 403)
  }

  if (user.role === 'driver') {
    const driver = await prisma.driver.findUnique({ where: { userId: user.id } })
    if (!driver || order.driverId !== driver.id) {
      throw new AppError('Forbidden', 403)
    }
  }

  const latestLocation = order.driverLocations[0]
  const statusEvents = await prisma.orderEvent.findMany({
    where: {
      orderId,
      eventType: {
        in: ['ORDER_CREATED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'],
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return {
    orderId: order.id,
    status: presentOrderStatus(order.status),
    paymentStatus: presentPaymentStatus(order.paymentStatus),
    pickup: {
      address: order.pickupAddress,
      lat: Number(order.pickupLat),
      lng: Number(order.pickupLng),
    },
    dropoff: {
      address: order.dropoffAddress,
      lat: Number(order.dropoffLat),
      lng: Number(order.dropoffLng),
    },
    driver: order.driver
      ? {
          id: order.driver.id,
          name: order.driver.user.name,
          lat: order.driver.currentLat ? Number(order.driver.currentLat) : null,
          lng: order.driver.currentLng ? Number(order.driver.currentLng) : null,
          lastSeenAt: order.driver.lastSeenAt,
        }
      : null,
    latestLocation: latestLocation
      ? {
          latitude: Number(latestLocation.latitude),
          longitude: Number(latestLocation.longitude),
          recordedAt: latestLocation.recordedAt,
        }
      : null,
    statusHistory: statusEvents,
    timestamp: new Date().toISOString(),
  }
}

export function openTrackingStream(orderId, req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  res.write(`event: connected\ndata: ${JSON.stringify({ orderId, connectedAt: new Date().toISOString() })}\n\n`)

  subscribeOrder(orderId, res)

  const interval = setInterval(() => {
    res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`)
  }, 15000)

  req.on('close', () => {
    clearInterval(interval)
    unsubscribeOrder(orderId, res)
  })
}
