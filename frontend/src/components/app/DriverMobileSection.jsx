import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import AvailableOrdersSection from './AvailableOrdersSection'

const driverStatuses = ['Picked Up', 'On The Way', 'Delivered']

function DriverMobileSection({ onBack }) {
  const [currentView, setCurrentView] = useState('active')
  const [orders, setOrders] = useState([])
  const [location, setLocation] = useState({ latitude: 47.9184, longitude: 106.9177 })

  async function load() {
    const data = await api.getDriverOrders()
    setOrders(data)
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const activeOrder = orders[0]

  async function sendLocation() {
    if (!activeOrder) return
    await api.driverLocation({ ...location, orderId: activeOrder.id })
  }

  if (currentView === 'available') {
    return <AvailableOrdersSection onBack={() => setCurrentView('active')} />
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]">← Back</button>
        <button 
          type="button" 
          onClick={() => setCurrentView('available')}
          className="rounded bg-[#8aa7ff]/20 px-3 py-1 text-xs text-[#8aa7ff] hover:bg-[#8aa7ff]/30 transition-colors"
        >
          View Available Orders
        </button>
      </div>
      
      <article className="rounded-lg border border-white/10 bg-white/2 p-4">
        <h3 className="text-3xl font-semibold text-white">Driver Active Jobs</h3>
        {activeOrder ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-white/75">Order: {activeOrder.id}</p>
            <p className="text-sm text-white/75">Status: {activeOrder.status}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => api.driverAccept(activeOrder.id).then(load)} className="rounded bg-[#8ea8ff] px-3 py-2 text-xs font-semibold uppercase text-[#071327]">Accept</button>
              {driverStatuses.map((status) => (
                <button key={status} type="button" onClick={() => api.driverUpdateStatus(activeOrder.id, status).then(load)} className="rounded border border-white/16 px-3 py-2 text-xs font-semibold uppercase text-white/80">
                  {status}
                </button>
              ))}
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" type="number" step="0.0001" value={location.latitude} onChange={(e) => setLocation((p) => ({ ...p, latitude: Number(e.target.value) }))} />
              <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" type="number" step="0.0001" value={location.longitude} onChange={(e) => setLocation((p) => ({ ...p, longitude: Number(e.target.value) }))} />
              <button type="button" onClick={sendLocation} className="rounded bg-[#7b95e5] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8ca4ee]">Send Location</button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/60">No active assigned orders.</p>
        )}
      </article>
    </section>
  )
}

export default DriverMobileSection
