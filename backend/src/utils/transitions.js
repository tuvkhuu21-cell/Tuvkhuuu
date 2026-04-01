import { AppError } from '../middleware/errorHandler.js'

const orderTransitions = {
  Pending: ['Assigned'],
  Assigned: ['PickedUp'],
  PickedUp: ['OnTheWay'],
  OnTheWay: ['Delivered'],
  Delivered: [],
}

const paymentTransitions = {
  Pending: ['Paid', 'Failed', 'CashOnDelivery'],
  Failed: ['Pending'],
  Paid: ['Refunded'],
  Refunded: [],
  CashOnDelivery: ['Paid'],
}

export function assertOrderTransition(currentStatus, nextStatus) {
  const allowed = orderTransitions[currentStatus] || []
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Invalid order status transition from ${currentStatus} to ${nextStatus}`, 400)
  }
}

export function assertPaymentTransition(currentStatus, nextStatus) {
  const allowed = paymentTransitions[currentStatus] || []
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Invalid payment status transition from ${currentStatus} to ${nextStatus}`, 400)
  }
}
