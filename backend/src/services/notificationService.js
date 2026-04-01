import { prisma } from '../db/client.js'
import { createId } from '../utils/id.js'
import { appendOrderEvent } from './eventService.js'

async function sendStub({ channel, recipient }) {
  return {
    status: 'sent',
    providerMessageId: `${channel}-${Date.now()}`,
    recipient,
  }
}

export async function notifyOrderEvent({ orderId, actorUserId, channel = 'email', recipient, message }) {
  await appendOrderEvent(prisma, {
    orderId,
    actorUserId,
    eventType: 'NOTIFICATION_TRIGGERED',
    payload: { channel, recipient, message },
  })

  try {
    const result = await sendStub({ channel, recipient, message })
    await prisma.notification.create({
      data: {
        id: createId(),
        orderId,
        channel,
        recipient,
        status: result.status,
        providerMessageId: result.providerMessageId,
      },
    })

    await appendOrderEvent(prisma, {
      orderId,
      actorUserId,
      eventType: 'NOTIFICATION_SENT',
      payload: result,
    })
  } catch (error) {
    await prisma.notification.create({
      data: {
        id: createId(),
        orderId,
        channel,
        recipient,
        status: 'failed',
      },
    })

    await appendOrderEvent(prisma, {
      orderId,
      actorUserId,
      eventType: 'NOTIFICATION_FAILED',
      payload: { message: error.message },
    })
  }
}
