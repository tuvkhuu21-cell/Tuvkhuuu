import { prisma } from '../../db/client.js'
import { AppError } from '../../middleware/errorHandler.js'
import { appendOrderEvent } from '../../services/eventService.js'
import { assertPaymentTransition } from '../../utils/transitions.js'
import { getPaymentProvider } from './providers/index.js'
import { publishOrderEvent } from '../../services/sseRegistry.js'

const provider = getPaymentProvider()

async function getOwnedOrder(orderId, user) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new AppError('Order not found', 404)

  if (user.role === 'customer' && order.customerId !== user.id) {
    throw new AppError('Forbidden', 403)
  }

  return order
}

export async function createPaymentIntent(input, user) {
  const order = await getOwnedOrder(input.orderId, user)
  const payment = await prisma.payment.findFirst({ where: { orderId: order.id }, orderBy: { createdAt: 'desc' } })
  if (!payment) throw new AppError('Payment not found', 404)

  const intent = await provider.createPaymentIntent({ payment, user, order })

  await appendOrderEvent(prisma, {
    orderId: order.id,
    actorUserId: user.id,
    eventType: 'PAYMENT_PENDING',
    payload: { intent },
  })

  return { payment, intent }
}

export async function confirmPayment(input, user) {
  const payment = await prisma.payment.findUnique({ where: { id: input.paymentId }, include: { order: true } })
  if (!payment) throw new AppError('Payment not found', 404)

  if (user.role === 'customer' && payment.customerId !== user.id) {
    throw new AppError('Forbidden', 403)
  }

  if (input.success && payment.status === 'Paid') {
    return payment
  }

  const response = await provider.confirmPayment({ payment, user, transactionReference: input.transactionReference })
  const nextStatus = input.success ? response.status : 'Failed'
  assertPaymentTransition(payment.status, nextStatus)

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        transactionReference: response.transactionReference,
        providerResponse: response.raw,
        paidAt: nextStatus === 'Paid' ? new Date() : null,
      },
    })

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: nextStatus,
      },
    })

    await appendOrderEvent(tx, {
      orderId: payment.orderId,
      actorUserId: user.id,
      eventType: nextStatus === 'Paid' ? 'PAYMENT_PAID' : 'PAYMENT_FAILED',
      payload: { paymentId: payment.id, transactionReference: response.transactionReference },
    })

    return updatedPayment
  })

  publishOrderEvent(payment.orderId, 'payment:update', {
    orderId: payment.orderId,
    paymentStatus: nextStatus,
    timestamp: new Date().toISOString(),
  })

  return updated
}

export async function handleWebhook(body) {
  return provider.handleWebhook(body)
}

export async function getPaymentByOrderId(orderId, user) {
  await getOwnedOrder(orderId, user)
  return prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } })
}

export async function getPaymentHistory(orderId, user) {
  await getOwnedOrder(orderId, user)
  return prisma.orderEvent.findMany({
    where: {
      orderId,
      eventType: {
        in: ['PAYMENT_CREATED', 'PAYMENT_PENDING', 'PAYMENT_PAID', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED'],
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function markCashOnDeliveryPaid(orderId, user) {
  if (!['manager', 'admin'].includes(user.role)) {
    throw new AppError('Forbidden', 403)
  }

  const payment = await prisma.payment.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' } })
  if (!payment) throw new AppError('Payment not found', 404)
  if (payment.paymentMethod !== 'CashOnDelivery') {
    throw new AppError('Payment method is not CashOnDelivery', 400)
  }

  assertPaymentTransition(payment.status, 'Paid')

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'Paid',
        paidAt: new Date(),
      },
    })

    await tx.order.update({ where: { id: orderId }, data: { paymentStatus: 'Paid' } })

    await appendOrderEvent(tx, {
      orderId,
      actorUserId: user.id,
      eventType: 'PAYMENT_PAID',
      payload: { paymentId: payment.id, method: 'CashOnDelivery' },
    })

    return updated
  })
}

export async function refundPayment(orderId, user, reason) {
  if (!['manager', 'admin'].includes(user.role)) {
    throw new AppError('Forbidden', 403)
  }

  const payment = await prisma.payment.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' } })
  if (!payment) throw new AppError('Payment not found', 404)

  assertPaymentTransition(payment.status, 'Refunded')
  const response = await provider.refundPayment({ payment, reason })

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'Refunded',
        providerResponse: response.raw,
        transactionReference: response.transactionReference,
      },
    })

    await tx.order.update({ where: { id: orderId }, data: { paymentStatus: 'Refunded' } })

    await appendOrderEvent(tx, {
      orderId,
      actorUserId: user.id,
      eventType: 'PAYMENT_REFUNDED',
      payload: { reason: reason || null, paymentId: payment.id },
    })

    return updated
  })
}
