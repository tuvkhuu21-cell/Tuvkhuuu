import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

function ManagerAnalyticsSection({ onBack }) {
  const [summary, setSummary] = useState(null)
  const [delays, setDelays] = useState(null)
  const [active, setActive] = useState([])
  const [availableOrders, setAvailableOrders] = useState([])
  const [payments, setPayments] = useState(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [a, b, c, d, e] = await Promise.all([
          api.dashboardSummary(), 
          api.dashboardDelays(), 
          api.dashboardActiveDeliveries(), 
          api.dashboardPaymentSummary(),
          api.getOrders()
        ])
        setSummary(a)
        setDelays(b)
        setActive(c)
        setPayments(d)
        const available = e.filter(order => order.status === 'Pending' && !order.driverId)
        setAvailableOrders(available)
      } catch (error) {
        console.warn('Dashboard data loading failed:', error.message)
        setSummary({ deliveriesToday: 0, activeDeliveries: 0 })
        setDelays({ totalDelayed: 0 })
        setActive([])
        setPayments({ refundedCount: 0 })
        setAvailableOrders([])
      }
    }
    
    loadDashboardData()
  }, [])

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 pt-4">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]">← Back</button>
      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Deliveries Today</p>
          <p className="mt-3 text-5xl font-semibold text-white">{summary?.deliveriesToday ?? '-'}</p>
        </article>
        <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Active Deliveries</p>
          <p className="mt-3 text-5xl font-semibold text-white">{summary?.activeDeliveries ?? '-'}</p>
        </article>
        <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Delayed</p>
          <p className="mt-3 text-5xl font-semibold text-white">{delays?.totalDelayed ?? '-'}</p>
        </article>
        <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Available Orders</p>
          <p className="mt-3 text-5xl font-semibold text-white">{availableOrders.length ?? '-'}</p>
        </article>
      </div>

      <article className="rounded-md border border-white/10 bg-white/[0.01] p-4 md:p-6">
        <h2 className="text-2xl font-medium uppercase tracking-tight text-white/85">Active Deliveries</h2>
        <div className="mt-4 space-y-2">
          {active.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded border border-white/8 bg-black/20 px-3 py-3 text-sm text-white/75">
              {item.id} • {item.status} • {item.customer?.name || 'Customer'} • {item.driver?.user?.name || 'Unassigned'}
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-md border border-white/10 bg-white/[0.01] p-4 md:p-6">
        <h2 className="text-2xl font-medium uppercase tracking-tight text-white/85">Available Orders</h2>
        <div className="mt-4 space-y-2">
          {availableOrders.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded border border-white/8 bg-black/20 px-3 py-3 text-sm text-white/75">
              {item.id} • {item.paymentStatus} • {item.senderName} → {item.receiverName} • ${item.deliveryFee}
            </div>
          ))}
          {availableOrders.length === 0 && (
            <p className="text-sm text-white/60">No available orders waiting for drivers.</p>
          )}
        </div>
      </article>

      <article className="rounded-md border border-white/10 bg-white/[0.01] p-4 md:p-6">
        <h2 className="text-2xl font-medium uppercase tracking-tight text-white/85">Payment Summary</h2>
        <p className="mt-2 text-sm text-white/60">Refunded Count: {payments?.refundedCount ?? '-'}</p>
      </article>
    </section>
  )
}

export default ManagerAnalyticsSection
