const orderHistory = [
  { id: 'SH-1109-P1', item: 'Heavy Machinery Parts • 420kg', date: 'Oct 24, 2023', amount: '$1,240.00', status: 'Delivered' },
  { id: 'SH-1108-A4', item: 'Electronic Components • 12kg', date: 'Oct 22, 2023', amount: '$85.20', status: 'Cancelled' },
  { id: 'SH-1099-M9', item: 'Medical Supplies • 85kg', date: 'Oct 18, 2023', amount: '$450.00', status: 'Delivered' },
  { id: 'SH-1082-Z2', item: 'Automotive Tools • 115kg', date: 'Oct 14, 2023', amount: '$2,100.00', status: 'Delivered' },
]

const activityFeed = [
  {
    title: 'Driver picked up order SH-9022',
    detail: 'Marcus (Fleet Alpha) is en route to Terminal 4.',
    time: '12m ago',
    icon: '⬢',
  },
  {
    title: 'Delivery confirmed: SH-8812',
    detail: 'Recipient: Global Logistics Hub, Dock 12.',
    time: '2h ago',
    icon: '✓',
  },
  {
    title: 'Weather Alert: Route North',
    detail: 'Potential delay of 20 mins due to rain near I-95.',
    time: '4h ago',
    icon: '△',
  },
]

function UserDashboardSection({ umbrellaLogo, onBack, onPlaceOrder, onViewAllHistory }) {
  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl border border-white/10 bg-[#05070d] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <header className="flex items-center justify-between border-b border-white/6 bg-black/35 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="text-sm text-white/60">☰</button>
          <img src={umbrellaLogo} alt="Umbrela" className="h-5 w-auto md:h-6" />
        </div>

        <div className="flex items-center gap-4 text-xs text-white/50">
          <span>◌</span>
          <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px]">USR</span>
          <button
            type="button"
            onClick={onBack}
            className="rounded border border-[#7c9af2]/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#a7bbff] hover:bg-[#7c9af2]/12"
          >
            Back
          </button>
        </div>
      </header>

      <div className="space-y-5 px-4 py-5 md:px-6 md:py-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h1 className="text-4xl font-semibold text-white md:text-6xl">
              UMBRELA <span className="text-[#7c9af2]">FLOW</span>
            </h1>
            <p className="mt-2 max-w-[600px] text-lg text-white/65">
              Your logistics ecosystem is operating at <span className="text-[#9bb2ff]">98.2% efficiency</span>. Monitor, route,
              and deploy assets with millisecond precision.
            </p>
            <button
              type="button"
              onClick={onPlaceOrder}
              className="mt-5 rounded bg-[#8ea8ff] px-6 py-4 text-base font-semibold text-[#071327] shadow-[0_0_28px_rgba(124,154,242,0.4)] hover:bg-[#a2b8ff]"
            >
              + Place New Order
            </button>
          </div>

          <div className="flex items-end justify-end">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">Global Transit Time</p>
              <p className="mt-1 text-6xl font-semibold text-[#9eb5ff]">
                18.4<span className="text-3xl text-white/85">HRS</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_285px]">
          <div className="space-y-4">
            <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9eb5ff]">● Live Tracking</p>
                  <h2 className="mt-1 text-4xl font-semibold text-white">SH-9022-X7</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">ETA</p>
                  <p className="text-4xl font-semibold text-white/90">14:30 PM</p>
                </div>
              </div>

              <div className="relative h-[220px] overflow-hidden rounded bg-[#081827]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_52%,rgba(181,239,255,0.35),transparent_16%),linear-gradient(150deg,#0a2032_0%,#091826_45%,#08101a_100%)]" />
                <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(82,186,230,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(82,186,230,0.32)_1px,transparent_1px)] [background-size:34px_34px]" />
                <div className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#9eb5ff] shadow-[0_0_10px_rgba(158,181,255,0.8)]" />
                <div className="absolute right-1/2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white/80" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/8 pt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Status</p>
                  <p className="text-xl font-semibold text-white/92">In Transit</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Speed</p>
                  <p className="text-xl font-semibold text-white/92">64 km/h</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Temp</p>
                  <p className="text-xl font-semibold text-white/92">4.2°C</p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-4xl font-semibold text-white/92">Activity Feed</h3>
                <span className="text-white/45">↻</span>
              </div>

              <div className="space-y-2">
                {activityFeed.map((item) => (
                  <div key={`${item.title}-${item.time}`} className="flex items-start gap-3 rounded border border-white/8 bg-black/20 px-3 py-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white/10 text-sm text-[#a7bbff]">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-white/90">{item.title}</p>
                      <p className="text-sm text-white/50">{item.detail}</p>
                    </div>
                    <span className="text-xs text-white/40">{item.time}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-4">
            <article className="rounded-lg border border-white/10 bg-white/2 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-3xl font-semibold text-white/90">Order History</h3>
                <button
                  type="button"
                  onClick={onViewAllHistory}
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9bb2ff] hover:text-[#bfd1ff]"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {orderHistory.map((order) => (
                  <div key={order.id} className="rounded border border-white/8 bg-black/20 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/90">{order.id}</p>
                      <span className="rounded bg-[#7c9af2]/25 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-[#bdd0ff]">
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/55">{order.item}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                      <span>{order.date}</span>
                      <span>{order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="relative overflow-hidden rounded-lg border border-white/10 bg-white/2 p-4">
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full border border-white/8" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Monthly Spend</p>
              <p className="mt-2 text-5xl font-semibold text-white">$14,204.00</p>
              <p className="mt-3 text-sm font-semibold text-[#9bb2ff]">↗ +12.4% vs last month</p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default UserDashboardSection
