import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api'

const availabilityTabs = ['Online', 'On Delivery', 'Offline']
const workflowSteps = ['Going to Pick Up Location', 'Picked Up the Item', 'On Delivery', 'Delivered']

function DriverDashboardSection({ onBack }) {
  const [profile, setProfile] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([])
  const [activeOrder, setActiveOrder] = useState(null)
  const [completedOrders, setCompletedOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyKey, setBusyKey] = useState('')
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)

  const activeStepIndex = useMemo(() => {
    if (!activeOrder?.workflowStatus) return -1
    return workflowSteps.indexOf(activeOrder.workflowStatus)
  }, [activeOrder])

  const nextStatus = activeStepIndex >= 0 && activeStepIndex < workflowSteps.length - 1 ? workflowSteps[activeStepIndex + 1] : null

  async function loadDriverData() {
    const [profileData, pendingData, activeData, completedData] = await Promise.all([
      api.getDriverProfile(),
      api.getDriverOrders(),
      api.getDriverActiveOrder(),
      api.getDriverCompletedOrders(),
    ])
    setProfile(profileData)
    setPendingOrders(pendingData)
    setActiveOrder(activeData)
    setCompletedOrders(completedData)
  }

  useEffect(() => {
    loadDriverData()
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Failed to load driver dashboard')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  async function runAction(key, action) {
    setBusyKey(key)
    setActionError('')
    try {
      await action()
      await loadDriverData()
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Action failed')
    } finally {
      setBusyKey('')
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl border border-white/10 bg-[#05070d] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <header className="flex items-center justify-between border-b border-white/6 bg-black/35 px-4 py-3 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9db6ff]">Driver Dashboard</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-[#7c9af2]/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#a7bbff] hover:bg-[#7c9af2]/12"
        >
          Back
        </button>
      </header>

      <div className="space-y-4 px-4 py-5 md:px-6 md:py-6">
        {loading ? <p className="text-sm text-white/65">Loading driver data...</p> : null}
        {error ? <p className="rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        {actionError ? <p className="rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{actionError}</p> : null}

        {profile ? (
          <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Driver Name</p>
                <h1 className="mt-1 text-3xl font-semibold text-white/92 md:text-4xl">{profile.name}</h1>
                <p className="mt-2 text-sm text-white/70">Role: <span className="font-semibold text-white/90">{profile.role}</span></p>
                <p className="mt-1 text-sm text-white/70">Status: <span className="font-semibold text-[#b8c9ff]">{profile.status}</span></p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/2 p-1">
                <div className="flex gap-1">
                  {availabilityTabs.map((tab) => {
                    const isActive = profile.status === tab
                    const key = `availability-${tab}`
                    return (
                      <button
                        key={tab}
                        type="button"
                        disabled={busyKey === key}
                        onClick={() => runAction(key, () => api.driverAvailability(tab))}
                        className={`rounded px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          isActive ? 'bg-[#8ea8ff] text-[#071327]' : 'text-white/60 hover:bg-white/8'
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white/92">Pending Assigned Deliveries</h2>
              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">{pendingOrders.length}</span>
            </div>

            <div className="space-y-3">
              {pendingOrders.length === 0 ? <p className="text-sm text-white/60">No pending assigned deliveries.</p> : null}
              {pendingOrders.map((order) => (
                <article key={order.id} className="rounded-md border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9db6ff]">Order {order.id}</p>
                  <div className="mt-2 space-y-1 text-sm text-white/75">
                    <p><span className="text-white/45">Sender:</span> {order.senderName} ({order.senderPhone})</p>
                    <p><span className="text-white/45">Pickup:</span> {order.pickupAddress}</p>
                    <p><span className="text-white/45">Pickup Contact:</span> {order.pickupContactName} ({order.pickupContactPhone})</p>
                    <p><span className="text-white/45">Drop-off:</span> {order.dropoffAddress}</p>
                    <p><span className="text-white/45">Receiver:</span> {order.receiverName} ({order.receiverPhone})</p>
                    <p><span className="text-white/45">Package:</span> {order.packageDescription}</p>
                    <p><span className="text-white/45">Weight:</span> {order.packageWeight}</p>
                    <p><span className="text-white/45">Notes:</span> {order.notes || '—'}</p>
                    <p><span className="text-white/45">Fee:</span> {order.deliveryFee}</p>
                    <p><span className="text-white/45">Payment:</span> {order.paymentMethod || '—'} / {order.paymentStatus}</p>
                    <p><span className="text-white/45">Status:</span> {order.workflowStatus}</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busyKey === `accept-${order.id}`}
                      onClick={() => runAction(`accept-${order.id}`, () => api.driverAccept(order.id))}
                      className="rounded bg-[#8ea8ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#071327] hover:bg-[#a2b8ff]"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busyKey === `reject-${order.id}`}
                      onClick={() => runAction(`reject-${order.id}`, () => api.driverReject(order.id))}
                      className="rounded border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-white/6"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyKey === `detail-${order.id}`}
                      onClick={() => runAction(`detail-${order.id}`, async () => setSelectedOrderDetail(await api.getDriverOrder(order.id)))}
                      className="rounded border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-white/6 sm:col-span-2"
                    >
                      View Full Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white/92">Active Delivery</h2>
            {activeOrder ? (
              <div className="mt-3 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9db6ff]">Order {activeOrder.id}</p>
                <div className="space-y-1 text-sm text-white/75">
                  <p><span className="text-white/45">Sender:</span> {activeOrder.senderName} ({activeOrder.senderPhone})</p>
                  <p><span className="text-white/45">Pickup:</span> {activeOrder.pickupAddress}</p>
                  <p><span className="text-white/45">Pickup Contact:</span> {activeOrder.pickupContactName} ({activeOrder.pickupContactPhone})</p>
                  <p><span className="text-white/45">Drop-off:</span> {activeOrder.dropoffAddress}</p>
                  <p><span className="text-white/45">Receiver:</span> {activeOrder.receiverName} ({activeOrder.receiverPhone})</p>
                  <p><span className="text-white/45">Package:</span> {activeOrder.packageDescription} ({activeOrder.packageWeight})</p>
                  <p><span className="text-white/45">Notes:</span> {activeOrder.notes || '—'}</p>
                  <p><span className="text-white/45">Fee:</span> {activeOrder.deliveryFee}</p>
                  <p><span className="text-white/45">Payment:</span> {activeOrder.paymentMethod || '—'} / {activeOrder.paymentStatus}</p>
                  <p><span className="text-white/45">Status:</span> {activeOrder.workflowStatus}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {workflowSteps.map((step, index) => (
                    <button
                      key={step}
                      type="button"
                      disabled={index > activeStepIndex + 1 || (index <= activeStepIndex && step !== activeOrder.workflowStatus)}
                      className={`rounded px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        activeOrder.workflowStatus === step ? 'bg-[#8ea8ff] text-[#071327]' : 'border border-white/16 text-white/70'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>

                {nextStatus ? (
                  <button
                    type="button"
                    disabled={busyKey === `progress-${activeOrder.id}`}
                    onClick={() => runAction(`progress-${activeOrder.id}`, () => api.driverUpdateStatus(activeOrder.id, nextStatus))}
                    className="rounded bg-[#7b95e5] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#8ca4ee]"
                  >
                    Mark: {nextStatus}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyKey === `detail-${activeOrder.id}`}
                  onClick={() => runAction(`detail-${activeOrder.id}`, async () => setSelectedOrderDetail(await api.getDriverOrder(activeOrder.id)))}
                  className="rounded border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-white/6"
                >
                  View Full Details
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/60">No active delivery right now.</p>
            )}
          </article>
        </section>

        <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white/92">Completed Deliveries</h2>
            <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">{completedOrders.length}</span>
          </div>
          {completedOrders.length === 0 ? <p className="text-sm text-white/60">No completed deliveries yet.</p> : null}
          <div className="space-y-2">
            {completedOrders.map((order) => (
              <article key={order.id} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75">
                <p className="font-semibold text-white/90">Order {order.id}</p>
                <p className="text-white/60">{order.pickupAddress} → {order.dropoffAddress}</p>
              </article>
            ))}
          </div>
        </article>

        {selectedOrderDetail ? (
          <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white/92">Selected Order Details</h2>
              <button
                type="button"
                onClick={() => setSelectedOrderDetail(null)}
                className="rounded border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/60"
              >
                Close
              </button>
            </div>
            <div className="grid gap-2 text-sm text-white/75 md:grid-cols-2">
              <p><span className="text-white/45">Order ID:</span> {selectedOrderDetail.id}</p>
              <p><span className="text-white/45">Sender:</span> {selectedOrderDetail.senderName} ({selectedOrderDetail.senderPhone})</p>
              <p><span className="text-white/45">Pickup:</span> {selectedOrderDetail.pickupAddress}</p>
              <p><span className="text-white/45">Pickup Contact:</span> {selectedOrderDetail.pickupContactName} ({selectedOrderDetail.pickupContactPhone})</p>
              <p><span className="text-white/45">Drop-off:</span> {selectedOrderDetail.dropoffAddress}</p>
              <p><span className="text-white/45">Receiver:</span> {selectedOrderDetail.receiverName} ({selectedOrderDetail.receiverPhone})</p>
              <p><span className="text-white/45">Package:</span> {selectedOrderDetail.packageDescription}</p>
              <p><span className="text-white/45">Weight:</span> {selectedOrderDetail.packageWeight}</p>
              <p><span className="text-white/45">Notes:</span> {selectedOrderDetail.notes || '—'}</p>
              <p><span className="text-white/45">Fee:</span> {selectedOrderDetail.deliveryFee}</p>
              <p><span className="text-white/45">Payment:</span> {selectedOrderDetail.paymentMethod || '—'} / {selectedOrderDetail.paymentStatus}</p>
              <p><span className="text-white/45">Status:</span> {selectedOrderDetail.workflowStatus || selectedOrderDetail.status}</p>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  )
}

export default DriverDashboardSection
