import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  AUTO_ASSIGN_RADIUS_METERS: z.coerce.number().default(7000),
  LOCATION_UPDATE_MIN_SECONDS: z.coerce.number().default(5),
  LOCATION_UPDATE_MIN_DISTANCE_METERS: z.coerce.number().default(25),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  PAYMENT_PROVIDER: z.string().default('mock'),
  PAYMENT_SUCCESS_RATE_FOR_MOCK: z.coerce.number().min(0).max(1).default(0.85),
  CURRENCY: z.string().default('MNT'),
  DELAY_THRESHOLD_MINUTES: z.coerce.number().default(30),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
