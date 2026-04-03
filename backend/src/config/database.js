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
    console.log('✅ MySQL database connected successfully via Prisma')
    
    return prisma
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message)
    throw error
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
    console.log('🔌 MySQL database connection closed')
  }
}
