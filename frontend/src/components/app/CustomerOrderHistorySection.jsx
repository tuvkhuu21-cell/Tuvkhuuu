import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function CustomerOrderHistorySection({ onBack, onTrackOrder }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    api
      .getOrders()
      .then((result) => {
        if (mounted) {
          setOrders(result)
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.response?.data?.message || 'Failed to load order history')
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="mx-auto w-full max-w-6xl pt-4">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]">
        ← Back
      </button>

      <div className="mt-4 rounded-lg border border-[#7c9af2]/30 bg-black/50 px-6 pb-5 pt-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg uppercase tracking-[0.12em] text-white/85">All Order History</h3>
          <span className="text-[10px] uppercase tracking-[0.12em] text-white/55">{orders.length} orders</span>
        </div>

        {loading ? <p className="text-xs text-white/65">Loading orders...</p> : null}
        {error ? <p className="text-xs text-red-300">{error}</p> : null}

        {!loading && !error && orders.length === 0 ? <p className="text-xs text-white/65">No orders found yet.</p> : null}

        {!loading && !error && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-md border border-white/15 bg-black/25 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/85">{order.id}</p>
                  <span className="rounded bg-[#7c9af2]/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#bdd0ff]">{order.status}</span>
                </div>
                <p className="mt-2 text-xs text-white/70">{order.pickupAddress} → {order.dropoffAddress}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/55">
                  <span>Payment: {order.paymentStatus}</span>
                  <span>{formatDate(order.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => onTrackOrder(order)}
                    className="rounded border border-white/25 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70 hover:border-white/40 hover:text-white"
                  >
                    Track
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default CustomerOrderHistorySection
