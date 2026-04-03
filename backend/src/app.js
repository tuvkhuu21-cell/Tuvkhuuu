import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { apiRouter } from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

// Initialize database connection
await connectDatabase()

export const app = express()

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'delivery-backend' })
})

app.use('/api', apiRouter)
app.use(notFoundHandler)
app.use(errorHandler)
