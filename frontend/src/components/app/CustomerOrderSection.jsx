import { useState } from 'react'
import { api } from '../../lib/api'

const phoneRegex = /^\+?[0-9\-\s]{7,20}$/

function CustomerOrderSection({ onOrderCreated, onBack }) {
  const [form, setForm] = useState({
    senderName: '',
    senderPhone: '',
    pickupAddress: '',
    pickupContactName: '',
    pickupContactPhone: '',
    dropoffAddress: '',
    receiverName: '',
    receiverPhone: '',
    packageWeight: 1,
    packageDescription: '',
    notes: '',
    estimatedMinutes: 45,
    deliveryFee: 15000,
    paymentMethod: 'Card',
    paymentStatus: 'Pending',
    requirePaymentBeforeDispatch: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function validateForm() {
    const requiredTextFields = [
      ['senderName', 'Your Name is required'],
      ['pickupAddress', 'Pickup Address is required'],
      ['pickupContactName', 'Pickup Contact Name is required'],
      ['dropoffAddress', 'Drop-off Address is required'],
      ['receiverName', 'Receiver Name is required'],
      ['packageDescription', 'Package Description is required'],
    ]

    for (const [key, message] of requiredTextFields) {
      if (!String(form[key] || '').trim()) {
        return message
      }
    }

    const phoneFields = [
      ['senderPhone', 'Your Phone Number is invalid'],
      ['pickupContactPhone', 'Pickup Contact Phone is invalid'],
      ['receiverPhone', 'Receiver Phone Number is invalid'],
    ]

    for (const [key, message] of phoneFields) {
      if (!phoneRegex.test(String(form[key] || '').trim())) {
        return message
      }
    }

    if (Number.isNaN(Number(form.packageWeight)) || Number(form.packageWeight) <= 0) {
      return 'Package Weight must be a positive number'
    }

    if (Number.isNaN(Number(form.deliveryFee)) || Number(form.deliveryFee) <= 0) {
      return 'Delivery Fee must be a positive number'
    }

    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const estimatedMinutesValue = Number(form.estimatedMinutes)
      const payload = {
        ...form,
        packageWeight: Number(form.packageWeight),
        deliveryFee: Number(form.deliveryFee),
      }

      if (!Number.isNaN(estimatedMinutesValue) && estimatedMinutesValue > 0) {
        payload.estimatedMinutes = estimatedMinutesValue
      } else {
        delete payload.estimatedMinutes
      }

      const order = await api.createOrder(payload)
      onOrderCreated(order)
    } catch (requestError) {
      const responseData = requestError.response?.data
      const fieldErrors = responseData?.details?.fieldErrors || {}
      const firstFieldError = Object.values(fieldErrors).find((messages) => Array.isArray(messages) && messages.length > 0)
      setError(firstFieldError?.[0] || responseData?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl pt-4">
      <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.12em] text-[#8aa7ff] hover:text-[#a8bcff]">
        ← Back
      </button>
      <div className="mt-4 rounded-lg border border-[#7c9af2]/30 bg-black/50 px-6 pb-5 pt-6">
        <h3 className="text-lg uppercase tracking-[0.12em] text-white/85">Create Delivery Order</h3>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Your Name" value={form.senderName} onChange={(e) => setForm((p) => ({ ...p, senderName: e.target.value }))} />
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Your Phone Number" value={form.senderPhone} onChange={(e) => setForm((p) => ({ ...p, senderPhone: e.target.value }))} />

          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Pickup address" value={form.pickupAddress} onChange={(e) => setForm((p) => ({ ...p, pickupAddress: e.target.value }))} />
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Pickup Contact Name" value={form.pickupContactName} onChange={(e) => setForm((p) => ({ ...p, pickupContactName: e.target.value }))} />
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Pickup Contact Phone" value={form.pickupContactPhone} onChange={(e) => setForm((p) => ({ ...p, pickupContactPhone: e.target.value }))} />

          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Dropoff address" value={form.dropoffAddress} onChange={(e) => setForm((p) => ({ ...p, dropoffAddress: e.target.value }))} />
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Receiver Name" value={form.receiverName} onChange={(e) => setForm((p) => ({ ...p, receiverName: e.target.value }))} />
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Receiver Phone Number" value={form.receiverPhone} onChange={(e) => setForm((p) => ({ ...p, receiverPhone: e.target.value }))} />

          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" type="number" step="0.01" placeholder="Package Weight" value={form.packageWeight} onChange={(e) => setForm((p) => ({ ...p, packageWeight: e.target.value }))} />
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" placeholder="Package Description" value={form.packageDescription} onChange={(e) => setForm((p) => ({ ...p, packageDescription: e.target.value }))} />

          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white md:col-span-2" placeholder="Additional Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />

          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" type="number" placeholder="Estimated minutes" value={form.estimatedMinutes} onChange={(e) => setForm((p) => ({ ...p, estimatedMinutes: e.target.value }))} />
          <input className="border-b border-white/45 bg-transparent pb-2 text-xs text-white" type="number" placeholder="Delivery Fee" value={form.deliveryFee} onChange={(e) => setForm((p) => ({ ...p, deliveryFee: e.target.value }))} />
          <select className="border border-white/25 bg-[#0a101b] p-2 text-xs text-white" value={form.paymentMethod} onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}>
            <option>Card</option>
            <option>CashOnDelivery</option>
            <option>Manual</option>
          </select>
          <select className="border border-white/25 bg-[#0a101b] p-2 text-xs text-white" value={form.paymentStatus} onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value }))}>
            <option>Pending</option>
            <option>CashOnDelivery</option>
            <option>Paid</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-white/75">
            <input type="checkbox" checked={form.requirePaymentBeforeDispatch} onChange={(e) => setForm((p) => ({ ...p, requirePaymentBeforeDispatch: e.target.checked }))} />
            Require payment before dispatch
          </label>
          <button type="submit" className="md:col-span-2 mt-2 rounded-md bg-[#7b95e5] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8ca4ee]" disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </form>
        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
      </div>
    </section>
  )
}

export default CustomerOrderSection
