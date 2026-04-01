import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  password: z.string().min(6).max(64),
  role: z.enum(['customer', 'driver', 'manager', 'admin']).default('customer'),
  phone: z.string().max(40).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional(),
})
