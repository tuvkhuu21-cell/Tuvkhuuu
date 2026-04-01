import * as trackingService from './tracking.service.js'

export async function getTracking(req, res) {
  const snapshot = await trackingService.getTrackingSnapshot(req.params.orderId, req.user)
  res.json(snapshot)
}

export async function streamTracking(req, res) {
  await trackingService.getTrackingSnapshot(req.params.orderId, req.user)
  trackingService.openTrackingStream(req.params.orderId, req, res)
}
