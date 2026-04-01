import { z } from 'zod'

export const createIntentSchema = z.object({
  orderId: z.string().uuid(),
  paymentMethod: z.enum(['Card', 'CashOnDelivery', 'Manual']),
})

export const confirmPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  transactionReference: z.string().optional(),
  success: z.boolean().default(true),
})

export const refundSchema = z.object({
  reason: z.string().min(2).max(500).optional(),
})
