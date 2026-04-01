import { AppError } from '../middleware/errorHandler.js'

const apiToOrder = {
  Pending: 'Pending',
  Assigned: 'Assigned',
  'Picked Up': 'PickedUp',
  'On The Way': 'OnTheWay',
  Delivered: 'Delivered',
}

const orderToApi = {
  Pending: 'Pending',
  Assigned: 'Assigned',
  PickedUp: 'Picked Up',
  OnTheWay: 'On The Way',
  Delivered: 'Delivered',
}

export function normalizeOrderStatus(value) {
  if (!apiToOrder[value]) {
    throw new AppError('Invalid order status', 400)
  }
  return apiToOrder[value]
}

export function presentOrderStatus(value) {
  return orderToApi[value] || value
}

export function presentPaymentStatus(value) {
  return value
}
