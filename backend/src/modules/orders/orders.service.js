import { Prisma } from '@prisma/client'
import { prisma } from '../../db/client.js'
import { env } from '../../config/env.js'
import { AppError } from '../../middleware/errorHandler.js'
import { createId } from '../../utils/id.js'
import { appendOrderEvent } from '../../services/eventService.js'
import { buildBoundingBox, haversineMeters, isValidCoordinate } from '../../utils/geo.js'
import { assertOrderTransition } from '../../utils/transitions.js'
import { normalizeOrderStatus, presentOrderStatus } from '../../utils/statusMaps.js'
import { serializeOrder } from '../../utils/serializers.js'
import { notifyOrderEvent } from '../../services/notificationService.js'
import { publishOrderEvent } from '../../services/sseRegistry.js'

const ASSIGNABLE_PAYMENT_STATUS = new Set(['Paid', 'CashOnDelivery'])

async function findNearestAvailableDriver(pickupLat, pickupLng, radiusMeters) {
  const box = buildBoundingBox(pickupLat, pickupLng, radiusMeters)
  const rows = await prisma.$queryRaw`
    SELECT
      d.id,
      d.user_id,
      d.current_lat,
      d.current_lng,
      (
        6371000 * ACOS(
          COS(RADIANS(${pickupLat})) * COS(RADIANS(d.current_lat)) * COS(RADIANS(d.current_lng) - RADIANS(${pickupLng})) +
          SIN(RADIANS(${pickupLat})) * SIN(RADIANS(d.current_lat))
        )
      ) AS distance_meters
    FROM drivers d
    WHERE d.is_available = true
      AND d.current_lat IS NOT NULL
      AND d.current_lng IS NOT NULL
      AND d.current_lat BETWEEN ${box.minLat} AND ${box.maxLat}
      AND d.current_lng BETWEEN ${box.minLng} AND ${box.maxLng}
    ORDER BY distance_meters ASC
    LIMIT 1
  `

  const candidate = rows[0]
  if (!candidate) return null

  const distance = Number(candidate.distance_meters)
  if (distance > radiusMeters) {
    return null
  }

  return {
    id: candidate.id,
    userId: candidate.user_id,
    distance,
  }
}

export async function createOrder(customerId, input) {
  const pickupLat = Number(input.pickupLat ?? 47.9184)
  const pickupLng = Number(input.pickupLng ?? 106.9177)
  const dropoffLat = Number(input.dropoffLat ?? 47.9305)
  const dropoffLng = Number(input.dropoffLng ?? 106.922)

  if (!isValidCoordinate(pickupLat, pickupLng) || !isValidCoordinate(dropoffLat, dropoffLng)) {
    throw new AppError('Invalid pickup/dropoff coordinates', 422)
  }

  const requestedPaymentStatus = input.paymentStatus || 'Pending'
  const paymentStatus = input.paymentMethod === 'CashOnDelivery' && requestedPaymentStatus === 'Pending' ? 'CashOnDelivery' : requestedPaymentStatus

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        id: createId(),
        customerId,
        senderName: input.senderName,
        senderPhone: input.senderPhone,
        pickupAddress: input.pickupAddress,
        pickupContactName: input.pickupContactName,
        pickupContactPhone: input.pickupContactPhone,
        dropoffAddress: input.dropoffAddress,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        pickupLat: new Prisma.Decimal(pickupLat),
        pickupLng: new Prisma.Decimal(pickupLng),
        dropoffLat: new Prisma.Decimal(dropoffLat),
        dropoffLng: new Prisma.Decimal(dropoffLng),
        packageWeight: new Prisma.Decimal(input.packageWeight),
        packageDescription: input.packageDescription,
        notes: input.notes || null,
        deliveryFee: new Prisma.Decimal(input.deliveryFee),
        estimatedMinutes: input.estimatedMinutes || null,
        paymentMethod: input.paymentMethod,
        paymentStatus,
      },
    })

    await tx.payment.create({
      data: {
        id: createId(),
        orderId: created.id,
        customerId,
        paymentMethod: input.paymentMethod,
        amount: new Prisma.Decimal(input.deliveryFee),
        currency: env.CURRENCY,
        status: paymentStatus,
        provider: env.PAYMENT_PROVIDER,
      },
    })

    await appendOrderEvent(tx, {
      orderId: created.id,
      actorUserId: customerId,
      eventType: 'ORDER_CREATED',
      payload: {
        senderName: input.senderName,
        senderPhone: input.senderPhone,
        pickupAddress: input.pickupAddress,
        pickupContactName: input.pickupContactName,
        pickupContactPhone: input.pickupContactPhone,
        dropoffAddress: input.dropoffAddress,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        packageWeight: input.packageWeight,
        packageDescription: input.packageDescription,
        notes: input.notes || null,
      },
    })

    await appendOrderEvent(tx, {
      orderId: created.id,
      actorUserId: customerId,
      eventType: 'PAYMENT_CREATED',
      payload: { paymentMethod: input.paymentMethod, amount: input.deliveryFee, paymentStatus },
    })

    await appendOrderEvent(tx, {
      orderId: created.id,
      actorUserId: customerId,
      eventType: paymentStatus === 'CashOnDelivery' ? 'PAYMENT_PENDING' : 'PAYMENT_PENDING',
      payload: { paymentStatus },
    })

    return created
  })

  const canAutoAssign = !input.requirePaymentBeforeDispatch || ASSIGNABLE_PAYMENT_STATUS.has(paymentStatus)
  // Disable auto-assignment to keep orders unassigned for manual driver acceptance
  // if (canAutoAssign) {
  //   await autoAssignOrder(order.id, customerId)
  // }

  const fullOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { payments: true, driver: true } })
  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: presentOrderStatus(fullOrder.status),
    paymentStatus: fullOrder.paymentStatus,
    timestamp: new Date().toISOString(),
  })
  return serializeOrder(fullOrder)
}

export async function getOrderById(orderId, user) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      driver: { include: { user: true } },
      payments: { orderBy: { createdAt: 'desc' } },
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

  return serializeOrder(order)
}

export async function listOrders(user) {
  const where =
    user.role === 'customer'
      ? { customerId: user.id }
      : user.role === 'driver'
        ? {
            driver: {
              userId: user.id,
            },
          }
        : {}

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
      driver: { include: { user: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map(serializeOrder)
}

export async function getTimeline(orderId, user) {
  await getOrderById(orderId, user)
  return prisma.orderEvent.findMany({ where: { orderId }, orderBy: { createdAt: 'asc' } })
}

export async function assignOrder(orderId, actor, driverId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new AppError('Order not found', 404)
  if (order.status === 'Delivered') throw new AppError('Delivered orders are read-only', 400)

  if (driverId) {
    const driver = await prisma.driver.findUnique({ where: { id: driverId } })
    if (!driver) throw new AppError('Driver not found', 404)

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          driverId: driver.id,
          status: 'Assigned',
          assignedAt: new Date(),
        },
      })

      await appendOrderEvent(tx, {
        orderId: order.id,
        actorUserId: actor.id,
        eventType: 'DRIVER_ASSIGNED',
        payload: { driverId: driver.id, mode: 'manual' },
      })
    })

    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { driver: true, payments: true } })
    publishOrderEvent(order.id, 'order:status', {
      orderId: order.id,
      status: 'Assigned',
      timestamp: new Date().toISOString(),
      paymentStatus: updated.paymentStatus,
    })
    return serializeOrder(updated)
  }

  const assigned = await autoAssignOrder(order.id, actor.id)
  const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { driver: true, payments: true } })
  return { ...serializeOrder(updated), autoAssigned: assigned }
}

export async function autoAssignOrder(orderId, actorUserId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new AppError('Order not found', 404)
  if (order.driverId || order.status === 'Delivered') return false

  const nearest = await findNearestAvailableDriver(Number(order.pickupLat), Number(order.pickupLng), env.AUTO_ASSIGN_RADIUS_METERS)
  if (!nearest) return false

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        driverId: nearest.id,
        status: 'Assigned',
        assignedAt: new Date(),
        acceptedAt: null,
        rejectedAt: null,
      },
    })

    await appendOrderEvent(tx, {
      orderId: order.id,
      actorUserId,
      eventType: 'DRIVER_ASSIGNED',
      payload: { driverId: nearest.id, distanceMeters: nearest.distance, mode: 'auto' },
    })
  })

  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: 'Assigned',
    timestamp: new Date().toISOString(),
    paymentStatus: order.paymentStatus,
  })
  return true
}

export async function updateOrderStatus(orderId, statusInput, actor) {
  const nextStatus = normalizeOrderStatus(statusInput)

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } })
  if (!order) throw new AppError('Order not found', 404)
  if (order.status === 'Delivered') {
    throw new AppError('Delivered orders are read-only', 400)
  }

  if (actor.role === 'driver') {
    const driver = await prisma.driver.findUnique({ where: { userId: actor.id } })
    if (!driver || driver.id !== order.driverId) {
      throw new AppError('Drivers can only update assigned orders', 403)
    }
  }

  assertOrderTransition(order.status, nextStatus)

  const updateData = {
    status: nextStatus,
  }

  if (nextStatus === 'PickedUp') updateData.pickedUpAt = new Date()
  if (nextStatus === 'Delivered') updateData.deliveredAt = new Date()

  const eventMap = {
    PickedUp: 'PICKED_UP',
    OnTheWay: 'ON_THE_WAY',
    Delivered: 'DELIVERED',
    Assigned: 'DRIVER_ASSIGNED',
    Pending: 'ORDER_UPDATED',
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.order.update({ where: { id: order.id }, data: updateData })
    await appendOrderEvent(tx, {
      orderId: order.id,
      actorUserId: actor.id,
      eventType: eventMap[nextStatus],
      payload: { status: nextStatus },
    })

    if (nextStatus === 'Delivered' && order.driverId) {
      await tx.driver.update({ where: { id: order.driverId }, data: { isAvailable: true } })
    }

    return row
  })

  if (nextStatus === 'Delivered') {
    await notifyOrderEvent({
      orderId: order.id,
      actorUserId: actor.id,
      recipient: order.customer.email,
      channel: 'email',
      message: `Order ${order.id} delivered successfully.`,
    })
  }

  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: statusInput,
    paymentStatus: updated.paymentStatus,
    timestamp: new Date().toISOString(),
  })

  return serializeOrder(updated)
}
