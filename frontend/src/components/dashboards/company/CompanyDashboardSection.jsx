const activeShipments = [
  { id: 'KN-9022-X', route: 'En route: Berlin / Munich', progress: 82 },
  { id: 'KN-4410-Z', route: 'Loading: Hamburg Port', progress: null, state: 'Staged' },
]

const networkHealth = [
  { label: 'Fleet Online', value: '94%' },
  { label: 'Carrier Capacity', value: '68%' },
  { label: 'Average TAT', value: '2.4h' },
]

const dispatchSummary = [
  { value: '14', label: 'Pending' },
  { value: '42', label: 'Active' },
  { value: '118', label: 'Completed' },
]

function CompanyDashboardSection({ umbrellaLogo, onBack }) {
  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl border border-white/10 bg-[#05070d] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <header className="flex items-center justify-between border-b border-white/6 bg-black/35 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="text-sm text-white/60">☰</button>
          <img src={umbrellaLogo} alt="Umbrela" className="h-5 w-auto md:h-6" />
        </div>

        <div className="flex items-center gap-4 text-xs text-white/50">
          <span>◌</span>
          <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px]">ADM</span>
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/45">Operational Command</p>
            <h1 className="mt-1 text-3xl font-semibold leading-none text-white md:text-6xl">
              Fleet Velocity <span className="text-[#7c9af2]">Dashboard</span>
            </h1>
          </div>

          <button
            type="button"
            className="rounded bg-[#8ea8ff] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#071327] hover:bg-[#a2b8ff]"
          >
            + New Shipment
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
              <article className="rounded-lg border border-white/10 bg-white/2 p-4 md:p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xl font-semibold text-white">Active Shipments</p>
                    <p className="text-xs text-white/45">Real-time vector tracking</p>
                  </div>
                  <span className="text-sm text-[#8ca6ff]">◎</span>
                </div>

                <div className="space-y-3">
                  {activeShipments.map((shipment) => (
                    <div key={shipment.id} className="rounded-md border border-white/8 bg-black/20 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white/90">{shipment.id}</p>
                          <p className="text-[11px] text-white/45">{shipment.route}</p>
                        </div>
                        {shipment.progress !== null ? (
                          <span className="text-[11px] font-semibold text-[#99b1ff]">{shipment.progress}%</span>
                        ) : (
                          <span className="rounded bg-white/8 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-white/70">
                            {shipment.state}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[#7c9af2]/60 to-[#afc0ff]"
                          style={{ width: `${shipment.progress ?? 35}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9ab1ff]">
                  Access Global Map ↗
                </button>
              </article>

              <article className="rounded-lg border border-white/10 bg-white/2 p-4">
                <p className="text-lg font-semibold text-white/95">Delivery Success</p>
                <p className="text-xs text-white/45">Monthly performance data</p>
                <div className="mt-5 flex items-end gap-2">
                  <p className="text-5xl font-bold leading-none text-white">98.4%</p>
                  <span className="pb-1 text-sm font-semibold text-[#9ab1ff]">+2.1%</span>
                </div>

                <div className="mt-4 flex items-end gap-1.5">
                  <span className="h-3 w-8 rounded bg-white/16" />
                  <span className="h-4 w-8 rounded bg-white/18" />
                  <span className="h-5 w-8 rounded bg-white/20" />
                  <span className="h-6 w-8 rounded bg-[#7c9af2]/65" />
                  <span className="h-7 w-8 rounded bg-[#9db6ff]" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/8 pt-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">On-time</p>
                    <p className="mt-1 text-xl font-semibold text-white/90">1,244</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">Delayed</p>
                    <p className="mt-1 text-xl font-semibold text-[#f1b0b0]">12</p>
                  </div>
                </div>
              </article>
            </div>

            <article className="overflow-hidden rounded-lg border border-white/10 bg-[#070d1f]">
              <div className="relative min-h-[330px] md:min-h-[420px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_65%,rgba(140,166,255,0.42),transparent_55%),radial-gradient(circle_at_18%_84%,rgba(133,86,235,0.24),transparent_35%),linear-gradient(130deg,#080d1f_0%,#060a16_60%,#05070f_100%)]" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(127,149,229,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(127,149,229,0.16)_1px,transparent_1px)] [background-size:48px_48px]" />
                <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                  <span className="rounded bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/85">
                    ● Live Network Density
                  </span>
                </div>

                <div className="absolute inset-x-4 bottom-4 grid gap-2 sm:grid-cols-3">
                  {dispatchSummary.map((item) => (
                    <div key={item.label} className="rounded border border-white/12 bg-black/38 px-4 py-3">
                      <p className="text-3xl font-semibold leading-none text-white">{item.value}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/55">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <aside className="space-y-4">
            <article className="rounded-lg border border-[#7c9af2]/35 bg-linear-to-b from-[#101a34] to-[#0a101f] p-4">
              <span className="inline-flex rounded border border-white/12 bg-black/20 px-2 py-1 text-xs text-[#9ab1ff]">⌘+</span>
              <h3 className="mt-4 text-2xl font-semibold text-white/95">Assign Driver</h3>
              <p className="mt-1 text-sm text-white/50">3 new orders pending immediate resource allocation.</p>
              <button
                type="button"
                className="mt-5 w-full rounded bg-[#8ea8ff] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#08142c] hover:bg-[#a0b8ff]"
              >
                Open Dispatch Queue
              </button>
            </article>

            <article className="rounded-lg border border-white/10 bg-white/2 p-4">
              <h3 className="text-xs uppercase tracking-[0.18em] text-white/58">Network Health</h3>

              <div className="mt-4 space-y-4">
                {networkHealth.map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{metric.label}</span>
                      <span className="font-semibold text-white/90">{metric.value}</span>
                    </div>
                    <div className="mt-2 h-px w-full bg-white/12" />
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-white/8 pt-4">
                <h4 className="text-xs uppercase tracking-[0.18em] text-white/58">Support Direct</h4>
                <div className="mt-3 flex items-center gap-2 rounded bg-black/20 p-2.5">
                  <span className="rounded bg-white/10 px-2 py-1 text-xs">◍</span>
                  <div>
                    <p className="text-sm font-semibold text-white/88">Priority Line</p>
                    <p className="text-xs text-white/45">Avg response: 2min</p>
                  </div>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CompanyDashboardSection
