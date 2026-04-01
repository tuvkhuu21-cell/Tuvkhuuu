import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api'

const orderFilters = ['All', 'New', 'Unassigned', 'Assigned', 'Active', 'Completed']

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function AdminDashboardSection({ onBack }) {
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [filter, setFilter] = useState('All')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [assignDriverByOrder, setAssignDriverByOrder] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyKey, setBusyKey] = useState('')

  const orderStats = useMemo(() => {
    const unassigned = orders.filter((order) => !order.driverId)
    const assigned = orders.filter((order) => order.driverId)
    const active = orders.filter((order) => ['Assigned', 'Picked Up', 'On The Way'].includes(order.status))
    const completed = orders.filter((order) => order.status === 'Delivered')
    const pending = orders.filter((order) => order.status === 'Pending')

    return { unassigned, assigned, active, completed, pending }
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (filter === 'All') return orders
    if (filter === 'New') return orderStats.pending
    if (filter === 'Unassigned') return orderStats.unassigned
    if (filter === 'Assigned') return orderStats.assigned.filter((order) => order.status === 'Assigned')
    if (filter === 'Active') return orderStats.active
    if (filter === 'Completed') return orderStats.completed
    return orders
  }, [filter, orders, orderStats])

  async function loadAdminData() {
    const [ordersData, driversData] = await Promise.all([api.adminOrders(), api.adminDrivers()])
    setOrders(ordersData)
    setDrivers(driversData)
  }

  useEffect(() => {
    loadAdminData()
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Failed to load admin data')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null)
      return
    }

    api.adminOrder(selectedOrderId)
      .then((data) => setSelectedOrder(data))
      .catch(() => setSelectedOrder(null))
  }, [selectedOrderId])

  async function handleAssign(orderId) {
    const driverId = assignDriverByOrder[orderId]
    if (!driverId) return

    setBusyKey(`assign-${orderId}`)
    setError('')
    try {
      await api.adminAssignOrder(orderId, driverId)
      await loadAdminData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to assign order')
    } finally {
      setBusyKey('')
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1400px] rounded-xl border border-[#7c9af2]/20 bg-black/65 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-[10px]">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9db6ff]">Admin Dashboard</p>

        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-[#7c9af2]/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#a7bbff] hover:bg-[#7c9af2]/10"
        >
          Back
        </button>
      </header>

      <div className="space-y-8 px-5 py-6 md:px-8 md:py-8">
        {loading ? <p className="text-sm text-white/70">Loading admin data...</p> : null}
        {error ? <p className="rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">New Orders</p>
            <p className="mt-5 text-5xl font-semibold leading-none text-white">{orderStats.pending.length}</p>
          </article>
          <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Unassigned</p>
            <p className="mt-5 text-5xl font-semibold leading-none text-white">{orderStats.unassigned.length}</p>
          </article>
          <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Active Deliveries</p>
            <p className="mt-5 text-5xl font-semibold leading-none text-white">{orderStats.active.length}</p>
          </article>
          <article className="rounded-md border border-white/10 bg-white/[0.02] px-5 py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Completed</p>
            <p className="mt-5 text-5xl font-semibold leading-none text-white">{orderStats.completed.length}</p>
          </article>
        </div>

        <section className="rounded-md border border-white/10 bg-white/[0.01] p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-medium uppercase tracking-tight text-white/85">Orders</h2>
            <div className="flex flex-wrap gap-2">
              {orderFilters.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    filter === value ? 'border-[#7c9af2]/45 bg-[#7c9af2]/18 text-[#c5d3ff]' : 'border-white/20 text-white/55'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-md border border-white/10 bg-black/25 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_230px]">
                  <div className="space-y-1 text-sm text-white/75">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9db6ff]">Order {order.id}</p>
                    <p><span className="text-white/45">Customer:</span> {order.customerName || '—'}</p>
                    <p><span className="text-white/45">Sender:</span> {order.senderName} ({order.senderPhone})</p>
                    <p><span className="text-white/45">Pickup:</span> {order.pickupAddress}</p>
                    <p><span className="text-white/45">Drop-off:</span> {order.dropoffAddress}</p>
                    <p><span className="text-white/45">Driver:</span> {order.driverName || 'Unassigned'}</p>
                    <p><span className="text-white/45">Payment:</span> {order.paymentStatus} ({order.paymentMethod || '—'})</p>
                    <p><span className="text-white/45">Status:</span> {order.status}</p>
                    <p><span className="text-white/45">Created:</span> {formatDate(order.createdAt)}</p>
                  </div>

                  <div className="space-y-2">
                    <select
                      value={assignDriverByOrder[order.id] || ''}
                      onChange={(event) => setAssignDriverByOrder((prev) => ({ ...prev, [order.id]: event.target.value }))}
                      className="w-full rounded border border-white/25 bg-[#0a101b] p-2 text-xs text-white"
                    >
                      <option value="">Select driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} • {driver.status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!assignDriverByOrder[order.id] || busyKey === `assign-${order.id}`}
                      onClick={() => handleAssign(order.id)}
                      className="w-full rounded bg-[#8ea8ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#071327] disabled:opacity-60"
                    >
                      Assign / Reassign
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="w-full rounded border border-white/16 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {filteredOrders.length === 0 ? <p className="text-sm text-white/60">No orders in this section.</p> : null}
          </div>
        </section>

        <section className="rounded-md border border-white/10 bg-white/[0.01] p-4 md:p-6">
          <h2 className="mb-4 text-2xl font-medium uppercase tracking-tight text-white/85">Drivers</h2>
          <div className="space-y-2">
            {drivers.map((driver) => (
              <article key={driver.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/75">
                <div>
                  <p className="font-semibold text-white/90">{driver.name}</p>
                  <p className="text-white/55">Role: {driver.role} • Phone: {driver.phone || '—'} • Active: {driver.activeDeliveries}</p>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.12em] text-white/70">
                  <p>{driver.status}</p>
                  <p className="text-white/45">{formatDate(driver.lastSeenAt || driver.updatedAt)}</p>
                </div>
              </article>
            ))}
            {drivers.length === 0 ? <p className="text-sm text-white/60">No drivers found.</p> : null}
          </div>
        </section>

        {selectedOrder ? (
          <section className="rounded-md border border-white/10 bg-white/[0.01] p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-medium uppercase tracking-tight text-white/85">Order Details</h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderId('')
                  setSelectedOrder(null)
                }}
                className="rounded border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/60"
              >
                Close
              </button>
            </div>
            <div className="grid gap-2 text-sm text-white/75 md:grid-cols-2">
              <p><span className="text-white/45">Order ID:</span> {selectedOrder.id}</p>
              <p><span className="text-white/45">Sender:</span> {selectedOrder.senderName} ({selectedOrder.senderPhone})</p>
              <p><span className="text-white/45">Pickup:</span> {selectedOrder.pickupAddress}</p>
              <p><span className="text-white/45">Pickup Contact:</span> {selectedOrder.pickupContactName} ({selectedOrder.pickupContactPhone})</p>
              <p><span className="text-white/45">Drop-off:</span> {selectedOrder.dropoffAddress}</p>
              <p><span className="text-white/45">Receiver:</span> {selectedOrder.receiverName} ({selectedOrder.receiverPhone})</p>
              <p><span className="text-white/45">Package:</span> {selectedOrder.packageDescription}</p>
              <p><span className="text-white/45">Weight:</span> {selectedOrder.packageWeight}</p>
              <p><span className="text-white/45">Notes:</span> {selectedOrder.notes || '—'}</p>
              <p><span className="text-white/45">Fee:</span> {selectedOrder.deliveryFee}</p>
              <p><span className="text-white/45">Payment:</span> {selectedOrder.paymentMethod || '—'} / {selectedOrder.paymentStatus}</p>
              <p><span className="text-white/45">Status:</span> {selectedOrder.status}</p>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}

export default AdminDashboardSection
