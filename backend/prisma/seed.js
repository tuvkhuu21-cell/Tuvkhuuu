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

  // Create a pending assigned order (not yet accepted)
  const pendingOrder = await prisma.order.create({
    data: {
      id: crypto.randomUUID(),
      customerId: customer.id,
      driverId: driver.id,
      senderName: 'Customer Demo',
      senderPhone: '+976-99112211',
      pickupAddress: 'Ulaanbaatar Airport',
      pickupContactName: 'Airport Pickup',
      pickupContactPhone: '+976-99112212',
      dropoffAddress: 'Shangri-La Mall, Ulaanbaatar',
      receiverName: 'Mall Customer',
      receiverPhone: '+976-99112213',
      pickupLat: 47.8411,
      pickupLng: 106.7960,
      dropoffLat: 47.9184,
      dropoffLng: 106.9177,
      packageWeight: 8.5,
      packageDescription: 'Travel luggage and souvenirs',
      notes: 'Fragile items inside',
      deliveryFee: 35000,
      status: 'Assigned',
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
      estimatedMinutes: 55,
      assignedAt: new Date(),
      // No acceptedAt - this is a pending assignment
    },
  })

  // Create an active order (already accepted)
  const activeOrder = await prisma.order.create({
    data: {
      id: crypto.randomUUID(),
      customerId: customer.id,
      driverId: driver.id,
      senderName: 'Business Customer',
      senderPhone: '+976-88112233',
      pickupAddress: 'Blue Sky Tower, Ulaanbaatar',
      pickupContactName: 'Office Manager',
      pickupContactPhone: '+976-88112234',
      dropoffAddress: 'Central Tower, Ulaanbaatar',
      receiverName: 'Client Office',
      receiverPhone: '+976-88112235',
      pickupLat: 47.9200,
      pickupLng: 106.9200,
      dropoffLat: 47.9100,
      dropoffLng: 106.9150,
      packageWeight: 5.2,
      packageDescription: 'Business documents and samples',
      notes: 'Urgent delivery',
      deliveryFee: 20000,
      status: 'PickedUp',
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
      estimatedMinutes: 25,
      assignedAt: new Date(),
      acceptedAt: new Date(), // This order has been accepted
      pickedUpAt: new Date(), // Already picked up
    },
  })

  // Create payments for both orders
  await prisma.payment.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        orderId: pendingOrder.id,
        customerId: customer.id,
        provider: 'mock',
        paymentMethod: 'Card',
        amount: 35000,
        currency: 'MNT',
        status: 'Paid',
        transactionReference: 'seed-txn-pending',
        providerResponse: { seeded: true },
        paidAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        orderId: activeOrder.id,
        customerId: customer.id,
        provider: 'mock',
        paymentMethod: 'Card',
        amount: 20000,
        currency: 'MNT',
        status: 'Paid',
        transactionReference: 'seed-txn-active',
        providerResponse: { seeded: true },
        paidAt: new Date(),
      },
    ],
  })

  // Create order events for both orders
  await prisma.orderEvent.createMany({
    data: [
      // Pending order events
      {
        id: crypto.randomUUID(),
        orderId: pendingOrder.id,
        eventType: 'ORDER_CREATED',
        payloadJson: { source: 'seed' },
        actorUserId: customer.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: pendingOrder.id,
        eventType: 'DRIVER_ASSIGNED',
        payloadJson: { mode: 'seed' },
        actorUserId: manager.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: pendingOrder.id,
        eventType: 'PAYMENT_PAID',
        payloadJson: { reference: 'seed-txn-pending' },
        actorUserId: customer.id,
      },
      // Active order events
      {
        id: crypto.randomUUID(),
        orderId: activeOrder.id,
        eventType: 'ORDER_CREATED',
        payloadJson: { source: 'seed' },
        actorUserId: customer.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: activeOrder.id,
        eventType: 'DRIVER_ASSIGNED',
        payloadJson: { mode: 'seed' },
        actorUserId: manager.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: activeOrder.id,
        eventType: 'DRIVER_ACCEPTED',
        payloadJson: { driverId: driver.id },
        actorUserId: driverUser.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: activeOrder.id,
        eventType: 'PAYMENT_PAID',
        payloadJson: { reference: 'seed-txn-active' },
        actorUserId: customer.id,
      },
      {
        id: crypto.randomUUID(),
        orderId: activeOrder.id,
        eventType: 'PICKED_UP',
        payloadJson: { status: 'Picked Up the Item' },
        actorUserId: driverUser.id,
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
