import { createId } from '../utils/id.js'

export async function appendOrderEvent(prismaClient, { orderId, eventType, payload = {}, actorUserId = null }) {
  return prismaClient.orderEvent.create({
    data: {
      id: createId(),
      orderId,
      eventType,
      payloadJson: payload,
      actorUserId,
    },
  })
}
