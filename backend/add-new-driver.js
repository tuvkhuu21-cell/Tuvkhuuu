import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function addOrderForNewDriver() {
  try {
    // Find the new driver user
    const newDriverUser = await prisma.user.findUnique({
      where: { email: 'newdriver@demo.com' }
    })

    if (!newDriverUser) {
      console.log('New driver user not found')
      return
    }

    // Find existing driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: newDriverUser.id }
    })

    if (!driver) {
      console.log('Driver profile not found for new driver')
      return
    }

    console.log('Found driver profile:', driver.id)

    // Find an existing customer to create orders for
    const customer = await prisma.user.findFirst({
      where: { role: 'customer' }
    })

    if (!customer) {
      console.log('No customer found to create orders')
      return
    }

    // Create a pending order for the new driver
    const pendingOrder = await prisma.order.create({
      data: {
        id: crypto.randomUUID(),
        customerId: customer.id,
        driverId: driver.id,
        senderName: 'Test Customer',
        senderPhone: '+976-99112255',
        pickupAddress: 'National Museum, Ulaanbaatar',
        pickupContactName: 'Museum Staff',
        pickupContactPhone: '+976-99112256',
        dropoffAddress: 'Genghis Khan Square, Ulaanbaatar',
        receiverName: 'Tourist Office',
        receiverPhone: '+976-99112257',
        pickupLat: 47.9200,
        pickupLng: 106.9200,
        dropoffLat: 47.9100,
        dropoffLng: 106.9150,
        packageWeight: 3.2,
        packageDescription: 'Museum gifts and postcards',
        notes: 'Please deliver carefully',
        deliveryFee: 15000,
        status: 'Assigned',
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        estimatedMinutes: 30,
        assignedAt: new Date(),
        // No acceptedAt - this is a pending assignment
      },
    })

    console.log('Pending order created for new driver:', pendingOrder.id)

    // Create payment for the order
    await prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        orderId: pendingOrder.id,
        customerId: customer.id,
        provider: 'mock',
        paymentMethod: 'Card',
        amount: 15000,
        currency: 'MNT',
        status: 'Paid',
        transactionReference: 'new-driver-order-1',
        providerResponse: { seeded: true },
        paidAt: new Date(),
      },
    })

    // Create order events
    await prisma.orderEvent.createMany({
      data: [
        {
          id: crypto.randomUUID(),
          orderId: pendingOrder.id,
          eventType: 'ORDER_CREATED',
          payloadJson: { source: 'new-driver-test' },
          actorUserId: customer.id,
        },
        {
          id: crypto.randomUUID(),
          orderId: pendingOrder.id,
          eventType: 'DRIVER_ASSIGNED',
          payloadJson: { mode: 'new-driver-test' },
          actorUserId: customer.id, // Self-assigned for testing
        },
        {
          id: crypto.randomUUID(),
          orderId: pendingOrder.id,
          eventType: 'PAYMENT_PAID',
          payloadJson: { reference: 'new-driver-order-1' },
          actorUserId: customer.id,
        },
      ],
    })

    console.log('Payment and events created for new driver order')

  } catch (error) {
    console.error('Error adding order for new driver:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addOrderForNewDriver()
