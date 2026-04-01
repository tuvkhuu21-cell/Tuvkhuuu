import { z } from 'zod'

const phoneRegex = /^\+?[0-9\-\s]{7,20}$/

export const createOrderSchema = z.object({
  senderName: z.string().min(2),
  senderPhone: z.string().regex(phoneRegex, 'Invalid sender phone number'),
  pickupAddress: z.string().min(4),
  pickupContactName: z.string().min(2),
  pickupContactPhone: z.string().regex(phoneRegex, 'Invalid pickup contact phone number'),
  dropoffAddress: z.string().min(4),
  receiverName: z.string().min(2),
  receiverPhone: z.string().regex(phoneRegex, 'Invalid receiver phone number'),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  dropoffLat: z.number().optional(),
  dropoffLng: z.number().optional(),
  packageWeight: z.number().positive(),
  packageDescription: z.string().min(2),
  notes: z.string().max(1000).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  deliveryFee: z.number().positive(),
  paymentMethod: z.enum(['Card', 'CashOnDelivery', 'Manual']).default('Card'),
  paymentStatus: z.enum(['Pending', 'Paid', 'Failed', 'Refunded', 'CashOnDelivery']).default('Pending'),
  requirePaymentBeforeDispatch: z.boolean().default(true),
})

export const assignOrderSchema = z.object({
  driverId: z.string().uuid().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Assigned', 'Picked Up', 'On The Way', 'Delivered']),
})
