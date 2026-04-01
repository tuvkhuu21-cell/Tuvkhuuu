import { useEffect, useState } from 'react'
import { api, getAccessToken } from '../../lib/api'
import { subscribeTracking } from '../../lib/sse'

function CustomerTrackingSection({ orderId, onBack }) {
  const [snapshot, setSnapshot] = useState(null)
  const [streamState, setStreamState] = useState('connecting')

  useEffect(() => {
    let unsubscribe = null

    async function init() {
      const current = await api.getTracking(orderId)
      setSnapshot(current)

      unsubscribe = subscribeTracking({
        orderId,
        token: getAccessToken(),
        onStateChange: setStreamState,
        onTrackingUpdate: (payload) => {
          setSnapshot((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              status: payload.status || prev.status,
              paymentStatus: payload.paymentStatus || prev.paymentStatus,
              latestLocation: {
                latitude: payload.latitude,
                longitude: payload.longitude,
                recordedAt: payload.timestamp,
              },
              driver: prev.driver
                ? { ...prev.driver, lat: payload.latitude, lng: payload.longitude, lastSeenAt: payload.timestamp }
                : prev.driver,
            }
          })
        },
        onOrderStatus: (payload) => {
          setSnapshot((prev) => (prev ? { ...prev, status: payload.status, paymentStatus: payload.paymentStatus } : prev))
        },
        onPaymentUpdate: (payload) => {
          setSnapshot((prev) => (prev ? { ...prev, paymentStatus: payload.paymentStatus } : prev))
        },
      })
    }

    init().catch(() => setStreamState('error'))

    return () => {
      unsubscribe?.()
    }
  }, [orderId])

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 pt-4">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]">← Back</button>
      <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9eb5ff]">● Live Tracking</p>
            <h2 className="mt-1 text-4xl font-semibold text-white">{orderId}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Connection</p>
            <p className="text-sm font-semibold text-white/90">{streamState}</p>
          </div>
        </div>

        <div className="relative h-[260px] overflow-hidden rounded bg-[#081827]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_52%,rgba(181,239,255,0.35),transparent_16%),linear-gradient(150deg,#0a2032_0%,#091826_45%,#08101a_100%)]" />
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(82,186,230,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(82,186,230,0.32)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute left-[14%] top-[55%] h-4 w-4 rounded-full bg-[#9eb5ff] shadow-[0_0_10px_rgba(158,181,255,0.8)]" />
          <div className="absolute right-[14%] top-[40%] h-3 w-3 rounded-full bg-white/80" />
          <div
            className="absolute h-3 w-3 rounded-full bg-[#8effbc] shadow-[0_0_12px_rgba(142,255,188,0.85)]"
            style={{ left: '50%', top: '50%' }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 border-t border-white/8 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Order Status</p>
            <p className="text-xl font-semibold text-white/92">{snapshot?.status || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Payment</p>
            <p className="text-xl font-semibold text-white/92">{snapshot?.paymentStatus || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Driver Lat</p>
            <p className="text-xl font-semibold text-white/92">{snapshot?.driver?.lat?.toFixed?.(4) ?? '-'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Driver Lng</p>
            <p className="text-xl font-semibold text-white/92">{snapshot?.driver?.lng?.toFixed?.(4) ?? '-'}</p>
          </div>
        </div>

        {snapshot?.statusHistory?.length ? (
          <div className="mt-4 border-t border-white/8 pt-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Status History</p>
            <div className="mt-2 space-y-1 text-xs text-white/70">
              {snapshot.statusHistory.map((event) => (
                <p key={event.id}>{event.eventType} • {new Date(event.createdAt).toLocaleString()}</p>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </section>
  )
}

export default CustomerTrackingSection
