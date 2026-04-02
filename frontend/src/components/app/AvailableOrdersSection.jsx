import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

function AvailableOrdersSection({ onBack }) {
  const [availableOrders, setAvailableOrders] = useState([])
  const [loading, setLoading] = useState(false)

  async function loadAvailableOrders() {
    try {
      setLoading(true)
      const data = await api.getAvailableOrders()
      setAvailableOrders(data)
    } catch (error) {
      console.error('Failed to load available orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function acceptOrder(orderId) {
    try {
      await api.acceptAvailableOrder(orderId)
      await loadAvailableOrders()
    } catch (error) {
      console.error('Failed to accept order:', error)
      alert(error.message || 'Failed to accept order')
    }
  }

  useEffect(() => {
    loadAvailableOrders()
  }, [])

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 pt-4">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]">← Back</button>
      
      <article className="rounded-md border border-white/10 bg-white/[0.02] p-4 md:p-6">
        <h2 className="text-2xl font-medium uppercase tracking-tight text-white/85">Available Orders</h2>
        
        {loading ? (
          <p className="mt-4 text-sm text-white/60">Loading available orders...</p>
        ) : availableOrders.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No available orders at the moment.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {availableOrders.map((order) => (
              <div key={order.id} className="rounded border border-white/8 bg-black/20 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-white">Order: {order.id}</span>
                      <span className="rounded bg-[#8aa7ff]/20 px-2 py-1 text-xs text-[#8aa7ff]">
                        {order.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="grid gap-2 text-xs text-white/75 md:grid-cols-2">
                      <div>
                        <p className="font-medium text-white/90">Pickup:</p>
                        <p>{order.pickupAddress}</p>
                        <p>{order.senderName} • {order.senderPhone}</p>
                      </div>
                      <div>
                        <p className="font-medium text-white/90">Dropoff:</p>
                        <p>{order.dropoffAddress}</p>
                        <p>{order.receiverName} • {order.receiverPhone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>Weight: {order.packageWeight}kg</span>
                      <span>Fee: ${order.deliveryFee}</span>
                      {order.estimatedMinutes && <span>Est: {order.estimatedMinutes}min</span>}
                    </div>
                    
                    {order.notes && (
                      <p className="text-xs text-white/60 italic">Notes: {order.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => acceptOrder(order.id)}
                      className="rounded bg-[#8ea8ff] px-4 py-2 text-xs font-semibold uppercase text-[#071327] hover:bg-[#7b95e5] transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}

export default AvailableOrdersSection
