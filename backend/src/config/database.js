import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

let prisma = null

export const connectDatabase = async () => {
  if (prisma) return prisma

  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL
        }
      },
      log: ['query', 'info', 'warn', 'error']
    })

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    return prisma
  } catch (error) {
    console.warn('⚠️ Database connection failed, running without database:', error.message)
    // Don't throw error, allow app to run without database for testing
    return null
  }
}

export const getDatabase = () => {
  if (!prisma) {
    throw new Error('Database not initialized. Call connectDatabase() first.')
  }
  return prisma
}

export const closeDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
    console.log('🔌 Database connection closed')
  }
}
