import { env } from '../../../config/env.js'

export const mockProvider = {
  async createPaymentIntent({ payment }) {
    return {
      provider: 'mock',
      intentId: `mock_intent_${payment.id}`,
      status: payment.status,
    }
  },

  async confirmPayment({ payment, transactionReference }) {
    const success = Math.random() < env.PAYMENT_SUCCESS_RATE_FOR_MOCK
    return {
      provider: 'mock',
      transactionReference: transactionReference || `mock_txn_${payment.id}_${Date.now()}`,
      status: success ? 'Paid' : 'Failed',
      raw: { success },
    }
  },

  async refundPayment({ payment }) {
    return {
      provider: 'mock',
      transactionReference: `mock_ref_${payment.id}_${Date.now()}`,
      status: 'Refunded',
      raw: { refunded: true },
    }
  },

  async handleWebhook(body) {
    return { ok: true, received: body }
  },
}
