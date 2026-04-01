import { z } from 'zod'

export const adminAssignOrderSchema = z.object({
  driverId: z.string().uuid(),
})
