export function subscribeTracking({ orderId, token, onTrackingUpdate, onOrderStatus, onPaymentUpdate, onStateChange }) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  const streamUrl = `${baseUrl}/tracking/${orderId}/stream?token=${encodeURIComponent(token || '')}`
  const source = new EventSource(streamUrl)

  source.onopen = () => onStateChange?.('connected')
  source.onerror = () => onStateChange?.('disconnected')

  source.addEventListener('tracking:update', (event) => {
    onTrackingUpdate?.(JSON.parse(event.data))
  })

  source.addEventListener('order:status', (event) => {
    onOrderStatus?.(JSON.parse(event.data))
  })

  source.addEventListener('payment:update', (event) => {
    onPaymentUpdate?.(JSON.parse(event.data))
  })

  return () => {
    source.close()
  }
}
