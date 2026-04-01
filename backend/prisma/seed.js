import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  await prisma.notification.deleteMany()
  await prisma.driverLocation.deleteMany()
  await prisma.orderEvent.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.order.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  const customer = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Customer Demo',
      email: 'customer@demo.com',
      passwordHash,
      role: 'customer',
    },
  })

  const driverUser = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Driver Demo',
      email: 'driver@demo.com',
      passwordHash,
      role: 'driver',
    },
  })

  const manager = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Manager Demo',
      email: 'manager@demo.com',
      passwordHash,
      role: 'manager',
    },
  })

  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Admin Demo',
      email: 'admin@demo.com',
      passwordHash,
      role: 'admin',
    },
  })

  const driver = await prisma.driver.create({
    data: {
      id: crypto.randomUUID(),
      userId: driverUser.id,
      phone: '+976-99112233',
      currentLat: 47.9184,
      currentLng: 106.9177,
      isAvailable: true,
    },
  })

  const order = await prisma.order.create({
    data: {
      id: crypto.randomUUID(),
      customerId: customer.id,
      driverId: driver.id,
      senderName: 'Customer Demo',
      senderPhone: '+976-99112211',
      pickupAddress: 'Sukhbaatar Square, Ulaanbaatar',
      pickupContactName: 'Pickup Contact',
      pickupContactPhone: '+976-99112212',
      dropoffAddress: 'Misheel Expo, Ulaanbaatar',
      receiverName: 'Receiver Demo',
      receiverPhone: '+976-99112213',
      pickupLat: 47.9184,
      pickupLng: 106.9177,
      dropoffLat: 47.8997,
      dropoffLng: 106.9107,
      packageWeight: 12.5,
      packageDescription: 'Documents and electronics',
      notes: 'Handle with care',
      deliveryFee: 25000,
      status: 'Assigned',
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
      estimatedMinutes: 40,
      assignedAt: new Date(),
    },
  })

  await prisma.payment.create({
    data: {
      id: crypto.randomUUID(),
      orderId: order.id,
      customerId: customer.id,
      provider: 'mock',
      paymentMethod: 'Card',
      amount: 25000,
      currency: 'MNT',
      status: 'Paid',
      transactionReference: 'seed-txn-1',
      providerResponse: { seeded: true },
      paidAt: new Date(),
    },
  })

  await prisma.orderEvent.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        orderId: order.id,
        eventType: 'ORDER_CREATED',
        payloadJson: { source: 'seed' },
        actorUserId: customer.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: order.id,
        eventType: 'DRIVER_ASSIGNED',
        payloadJson: { mode: 'seed' },
        actorUserId: manager.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: order.id,
        eventType: 'PAYMENT_PAID',
        payloadJson: { reference: 'seed-txn-1' },
        actorUserId: customer.id,
      },
    ],
  })

  console.log('Seed complete: customer/driver/manager/admin accounts created with password password123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
