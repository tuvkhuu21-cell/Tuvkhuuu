import { presentOrderStatus, presentPaymentStatus } from './statusMaps.js'

export function serializeOrder(order) {
  return {
    ...order,
    status: presentOrderStatus(order.status),
    paymentStatus: presentPaymentStatus(order.paymentStatus),
  }
}
