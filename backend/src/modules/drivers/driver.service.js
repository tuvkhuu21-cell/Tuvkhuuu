import { Prisma } from '@prisma/client'
import { prisma } from '../../db/client.js'
import { env } from '../../config/env.js'
import { AppError } from '../../middleware/errorHandler.js'
import { createId } from '../../utils/id.js'
import { appendOrderEvent } from '../../services/eventService.js'
import { assertOrderTransition } from '../../utils/transitions.js'
import { normalizeOrderStatus, presentOrderStatus } from '../../utils/statusMaps.js'
import { isValidCoordinate, movedBeyondThreshold } from '../../utils/geo.js'
import { publishOrderEvent } from '../../services/sseRegistry.js'
import { serializeOrder } from '../../utils/serializers.js'

const driverWorkflowStatusMap = {
  Assigned: 'Going to Pick Up Location',
  PickedUp: 'Picked Up the Item',
  OnTheWay: 'On Delivery',
  Delivered: 'Delivered',
}

const driverWorkflowToOrderStatus = {
  'Going to Pick Up Location': 'Assigned',
  'Picked Up the Item': 'PickedUp',
  'On Delivery': 'OnTheWay',
  Delivered: 'Delivered',
}

function presentDriverWorkflowStatus(orderStatus) {
  return driverWorkflowStatusMap[orderStatus] || presentOrderStatus(orderStatus)
}

function serializeDriverOrder(order) {
  const serialized = serializeOrder(order)
  return {
    ...serialized,
    workflowStatus: presentDriverWorkflowStatus(order.status),
  }
}

async function getDriverByUserId(userId) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, role: true } } },
  })

  if (!driver) throw new AppError('Driver profile not found', 404)
  return driver
}

async function getDriverActiveOrderCount(driverId) {
  return prisma.order.count({
    where: {
      driverId,
      status: { in: ['Assigned', 'PickedUp', 'OnTheWay'] }
    }
  })
}

async function findActiveOrder(driverId) {
  return prisma.order.findFirst({
    where: {
      driverId,
      OR: [
        { status: 'Assigned', acceptedAt: { not: null } },
        { status: { in: ['PickedUp', 'OnTheWay'] } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })
}

function deriveDriverAvailability(driver, activeOrder) {
  if (activeOrder) return 'On Delivery'
  return driver.isAvailable ? 'Online' : 'Offline'
}

export async function getDriverProfile(userId) {
  const driver = await getDriverByUserId(userId)
  const activeOrder = await findActiveOrder(driver.id)

  return {
    id: driver.id,
    userId: driver.userId,
    name: driver.user.name,
    role: driver.user.role,
    status: deriveDriverAvailability(driver, activeOrder),
    isAvailable: driver.isAvailable,
    phone: driver.phone,
    lastSeenAt: driver.lastSeenAt,
  }
}

export async function getAssignedOrders(userId) {
  const driver = await getDriverByUserId(userId)

  const orders = await prisma.order.findMany({
    where: {
      driverId: driver.id,
      status: 'Assigned',
      acceptedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map(serializeDriverOrder)
}

export async function getActiveOrder(userId) {
  const driver = await getDriverByUserId(userId)
  const activeOrder = await findActiveOrder(driver.id)
  return activeOrder ? serializeDriverOrder(activeOrder) : null
}

export async function getAvailableOrders(userId) {
  const driver = await getDriverByUserId(userId)
  
  const activeOrderCount = await getDriverActiveOrderCount(driver.id)
  if (activeOrderCount >= driver.maxDeliveries) {
    return []
  }

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['Unassigned', 'Pending'] },
      driverId: null,
      paymentStatus: { in: ['Paid', 'CashOnDelivery'] }
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  return orders.map(serializeDriverOrder)
}

export async function getCompletedOrders(userId) {
  const driver = await getDriverByUserId(userId)
  const orders = await prisma.order.findMany({
    where: { driverId: driver.id, status: 'Delivered' },
    orderBy: { deliveredAt: 'desc' },
    take: 10,
  })
  return orders.map(serializeDriverOrder)
}

export async function getDriverOrderById(userId, orderId) {
  const driver = await getDriverByUserId(userId)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!order) throw new AppError('Order not found', 404)
  if (order.driverId !== driver.id) {
    throw new AppError('Order not assigned to this driver', 403)
  }

  return serializeDriverOrder(order)
}

export async function acceptAvailableOrder(userId, orderId) {
  const driver = await getDriverByUserId(userId)
  
  const activeOrderCount = await getDriverActiveOrderCount(driver.id)
  if (activeOrderCount >= driver.maxDeliveries) {
    throw new AppError(`Cannot accept more than ${driver.maxDeliveries} deliveries at once`, 400)
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    throw new AppError('Order not found', 404)
  }
  if (order.status !== 'Pending' || order.driverId) {
    throw new AppError('Order is no longer available', 400)
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.order.update({
      where: { id: order.id },
      data: {
        driverId: driver.id,
        status: 'Assigned',
        assignedAt: new Date(),
        acceptedAt: new Date(),
      },
    })

    await tx.driver.update({ where: { id: driver.id }, data: { isAvailable: false } })

    await appendOrderEvent(tx, {
      orderId: order.id,
      actorUserId: userId,
      eventType: 'DRIVER_ACCEPTED',
      payload: { driverId: driver.id, mode: 'manual' },
    })

    return row
  })

  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: 'Assigned',
    paymentStatus: updated.paymentStatus,
    timestamp: new Date().toISOString(),
  })

  return serializeDriverOrder(updated)
}

export async function acceptOrder(userId, orderId) {
  const driver = await getDriverByUserId(userId)

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    throw new AppError('Order not found', 404)
  }

  // Handle both Assigned and Unassigned orders
  const isUnassigned = order.status === 'Unassigned' || (order.status === 'Pending' && !order.driverId)
  const isAssigned = order.driverId === driver.id

  if (!isUnassigned && !isAssigned) {
    throw new AppError('Order not available for this driver', 403)
  }
  
  // For assigned orders, check status
  if (isAssigned && order.status !== 'Assigned') {
    throw new AppError('Only assigned orders can be accepted', 400)
  }
  
  // For unassigned orders, check if they're still available
  if (isUnassigned && order.driverId) {
    throw new AppError('Order is no longer available', 400)
  }
  if (order.acceptedAt) {
    return serializeDriverOrder(order)
  }

  const activeOrderCount = await getDriverActiveOrderCount(driver.id)
  if (activeOrderCount >= driver.maxDeliveries) {
    throw new AppError(`Cannot accept more than ${driver.maxDeliveries} deliveries at once`, 400)
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updateData = {
      acceptedAt: new Date(),
      rejectedAt: null,
    }

    // For unassigned orders, set driverId and assignedAt
    if (isUnassigned) {
      updateData.driverId = driver.id
      updateData.assignedAt = new Date()
      updateData.status = 'Assigned'
    }

    const row = await tx.order.update({
      where: { id: order.id },
      data: updateData,
    })

    await tx.driver.update({ where: { id: driver.id }, data: { isAvailable: false } })

    await appendOrderEvent(tx, {
      orderId: order.id,
      actorUserId: userId,
      eventType: 'DRIVER_ACCEPTED',
      payload: { driverId: driver.id, mode: isUnassigned ? 'manual' : 'assigned' },
    })

    return row
  })

  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: 'Going to Pick Up Location',
    paymentStatus: updated.paymentStatus,
    timestamp: new Date().toISOString(),
  })

  return serializeDriverOrder(updated)
}

export async function rejectOrder(userId, orderId) {
  const driver = await getDriverByUserId(userId)
  const order = await prisma.order.findUnique({ where: { id: orderId } })

  if (!order || order.driverId !== driver.id) {
    throw new AppError('Order not assigned to this driver', 403)
  }
  if (order.status !== 'Assigned' || order.acceptedAt) {
    throw new AppError('Only pending assigned deliveries can be rejected', 400)
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'Pending',
        driverId: null,
        assignedAt: null,
        acceptedAt: null,
        rejectedAt: new Date(),
      },
    })

    await appendOrderEvent(tx, {
      orderId: order.id,
      actorUserId: userId,
      eventType: 'DRIVER_REJECTED',
      payload: { driverId: driver.id },
    })

    return row
  })

  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: 'Pending',
    paymentStatus: updated.paymentStatus,
    timestamp: new Date().toISOString(),
  })

  return serializeDriverOrder(updated)
}

export async function updateDriverAvailability(userId, statusInput) {
  const driver = await getDriverByUserId(userId)
  const activeOrder = await findActiveOrder(driver.id)

  if (statusInput === 'On Delivery' && !activeOrder) {
    throw new AppError('On Delivery is only available with an active accepted delivery', 400)
  }
  if (statusInput === 'Online' && activeOrder) {
    throw new AppError('Cannot set Online while an active delivery is in progress', 400)
  }
  if (statusInput === 'Offline' && activeOrder) {
    throw new AppError('Cannot go offline while an active delivery is in progress', 400)
  }

  const isAvailable = statusInput === 'Online'
  const updated = await prisma.driver.update({ where: { id: driver.id }, data: { isAvailable } })

  return {
    id: updated.id,
    status: deriveDriverAvailability(updated, activeOrder),
    isAvailable: updated.isAvailable,
  }
}

export async function updateDriverOrderStatus(userId, orderId, statusInput) {
  const driver = await getDriverByUserId(userId)

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.driverId !== driver.id) {
    throw new AppError('Order not assigned to this driver', 403)
  }
  if (!order.acceptedAt && order.status === 'Assigned') {
    throw new AppError('Accept the delivery before updating its status', 400)
  }

  const mappedStatus = driverWorkflowToOrderStatus[statusInput]
  const nextStatus = mappedStatus || normalizeOrderStatus(statusInput)

  if (nextStatus === 'Assigned') {
    if (order.status !== 'Assigned') {
      throw new AppError('Invalid status progression for this delivery', 400)
    }
    return serializeDriverOrder(order)
  }

  assertOrderTransition(order.status, nextStatus)

  const updateData = { status: nextStatus }
  if (nextStatus === 'PickedUp') updateData.pickedUpAt = new Date()
  if (nextStatus === 'Delivered') updateData.deliveredAt = new Date()

  const eventTypeByStatus = {
    PickedUp: 'PICKED_UP',
    OnTheWay: 'ON_THE_WAY',
    Delivered: 'DELIVERED',
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.order.update({ where: { id: order.id }, data: updateData })

    await appendOrderEvent(tx, {
      orderId: order.id,
      actorUserId: userId,
      eventType: eventTypeByStatus[nextStatus],
      payload: { status: presentDriverWorkflowStatus(nextStatus) },
    })

    if (nextStatus === 'Delivered') {
      await tx.driver.update({ where: { id: driver.id }, data: { isAvailable: true } })
    }

    return row
  })

  publishOrderEvent(order.id, 'order:status', {
    orderId: order.id,
    status: presentDriverWorkflowStatus(nextStatus),
    paymentStatus: updated.paymentStatus,
    timestamp: new Date().toISOString(),
  })

  return serializeDriverOrder(updated)
}

export async function updateDriverLocation(userId, body) {
  const driver = await prisma.driver.findUnique({ where: { userId } })
  if (!driver) throw new AppError('Driver profile not found', 404)

  const lat = Number(body.latitude)
  const lng = Number(body.longitude)
  if (!isValidCoordinate(lat, lng)) {
    throw new AppError('Invalid coordinates', 422)
  }

  const minDistance = env.LOCATION_UPDATE_MIN_DISTANCE_METERS
  const shouldWriteHistory = movedBeyondThreshold(
    driver.currentLat ? Number(driver.currentLat) : null,
    driver.currentLng ? Number(driver.currentLng) : null,
    lat,
    lng,
    minDistance,
  )

  await prisma.driver.update({
    where: { id: driver.id },
    data: {
      currentLat: new Prisma.Decimal(lat),
      currentLng: new Prisma.Decimal(lng),
      lastSeenAt: new Date(),
    },
  })

  if (shouldWriteHistory) {
    await prisma.driverLocation.create({
      data: {
        id: createId(),
        driverId: driver.id,
        orderId: body.orderId || null,
        latitude: new Prisma.Decimal(lat),
        longitude: new Prisma.Decimal(lng),
        recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
      },
    })
  }

  if (body.orderId) {
    const order = await prisma.order.findUnique({ where: { id: body.orderId } })
    publishOrderEvent(body.orderId, 'tracking:update', {
      orderId: body.orderId,
      driverId: driver.id,
      latitude: lat,
      longitude: lng,
      status: order ? presentOrderStatus(order.status) : null,
      paymentStatus: order ? order.paymentStatus : null,
      timestamp: new Date().toISOString(),
    })
  }

  return { ok: true, shouldWriteHistory }
}

export async function getAllActiveOrders() {
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { status: 'Unassigned', driverId: null },
        { status: { in: ['Assigned', 'PickedUp', 'OnTheWay'] }, driverId: { not: null } }
      ]
    },
    include: {
      driver: {
        include: {
          user: { select: { id: true, name: true, role: true } }
        }
      },
      customer: { select: { id: true, name: true, email: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return orders.map(order => ({
    ...serializeDriverOrder(order),
    driver: order.driver ? {
      id: order.driver.id,
      name: order.driver.user.name,
      phone: order.driver.phone,
      status: order.driver.isAvailable ? 'Online' : 'Offline'
    } : null
  }))
}
