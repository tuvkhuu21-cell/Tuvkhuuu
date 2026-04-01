import { env } from '../../../config/env.js'
import { mockProvider } from './mockProvider.js'

export function getPaymentProvider() {
  if (env.PAYMENT_PROVIDER === 'mock') {
    return mockProvider
  }

  return mockProvider
}
