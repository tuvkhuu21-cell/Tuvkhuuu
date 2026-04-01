import { z } from 'zod'

export const driverLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  orderId: z.string().uuid().optional(),
  recordedAt: z.string().datetime().optional(),
})

export const driverStatusSchema = z.object({
  status: z.enum(['Going to Pick Up Location', 'Picked Up the Item', 'On Delivery', 'Delivered']),
})

export const driverAvailabilitySchema = z.object({
  status: z.enum(['Online', 'On Delivery', 'Offline']),
})
