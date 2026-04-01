const orderSubscribers = new Map()

export function subscribeOrder(orderId, res) {
  if (!orderSubscribers.has(orderId)) {
    orderSubscribers.set(orderId, new Set())
  }

  orderSubscribers.get(orderId).add(res)
}

export function unsubscribeOrder(orderId, res) {
  const subs = orderSubscribers.get(orderId)
  if (!subs) return
  subs.delete(res)
  if (subs.size === 0) {
    orderSubscribers.delete(orderId)
  }
}

export function publishOrderEvent(orderId, event, data) {
  const subs = orderSubscribers.get(orderId)
  if (!subs) return

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  subs.forEach((res) => res.write(payload))
}

export function heartbeatOrderStream(orderId) {
  publishOrderEvent(orderId, 'heartbeat', { timestamp: new Date().toISOString() })
}
