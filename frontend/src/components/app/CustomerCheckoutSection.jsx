import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

function CustomerCheckoutSection({ order, onPaid, onBack }) {
  const [paymentId, setPaymentId] = useState('')
  const [status, setStatus] = useState(order.paymentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function boot() {
      const intent = await api.createPaymentIntent({ orderId: order.id, paymentMethod: order.paymentMethod || 'Card' })
      const firstPayment = intent.payment?.id || intent.payment?.[0]?.id
      if (firstPayment) {
        setPaymentId(firstPayment)
      }
    }

    if (order.paymentMethod === 'Card') {
      boot().catch(() => {})
    }
  }, [order])

  async function handleConfirm() {
    if (!paymentId) return
    setLoading(true)
    setError('')
    try {
      const result = await api.confirmPayment({ paymentId, success: true })
      setStatus(result.status)
      onPaid?.(result)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Payment confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl pt-4">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]">← Back</button>
      <div className="mt-4 rounded-lg border border-[#7c9af2]/30 bg-black/50 p-6">
        <h3 className="text-lg uppercase tracking-[0.12em] text-white/85">Checkout Payment</h3>
        <p className="mt-2 text-sm text-white/70">Order #{order.id.slice(0, 8)} • Method: {order.paymentMethod}</p>
        <p className="mt-1 text-sm text-white/70">Amount: {order.payments?.[0]?.amount || 'See invoice'} MNT</p>
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#9bb2ff]">Status: {status}</p>

        {order.paymentMethod === 'Card' ? (
          <div className="mt-5 space-y-3">
            <input className="w-full border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Card Number (mock)" />
            <div className="grid grid-cols-2 gap-3">
              <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="MM/YY" />
              <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="CVV" />
            </div>
            <button type="button" disabled={loading} onClick={handleConfirm} className="rounded-md bg-[#7b95e5] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8ca4ee]">
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => onPaid?.({ status: order.paymentStatus })} className="mt-5 rounded-md bg-[#7b95e5] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8ca4ee]">
            Continue to Tracking
          </button>
        )}
        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
      </div>
    </section>
  )
}

export default CustomerCheckoutSection
