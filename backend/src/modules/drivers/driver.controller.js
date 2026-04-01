import * as driverService from './driver.service.js'

export async function getProfile(req, res) {
  const data = await driverService.getDriverProfile(req.user.id)
  res.json(data)
}

export async function getAssignedOrders(req, res) {
  const data = await driverService.getAssignedOrders(req.user.id)
  res.json(data)
}

export async function getActiveOrder(req, res) {
  const data = await driverService.getActiveOrder(req.user.id)
  res.json(data)
}

export async function getCompletedOrders(req, res) {
  const data = await driverService.getCompletedOrders(req.user.id)
  res.json(data)
}

export async function getOrderById(req, res) {
  const data = await driverService.getDriverOrderById(req.user.id, req.params.id)
  res.json(data)
}

export async function acceptOrder(req, res) {
  const data = await driverService.acceptOrder(req.user.id, req.params.id)
  res.json(data)
}

export async function rejectOrder(req, res) {
  const data = await driverService.rejectOrder(req.user.id, req.params.id)
  res.json(data)
}

export async function updateAvailability(req, res) {
  const data = await driverService.updateDriverAvailability(req.user.id, req.body.status)
  res.json(data)
}

export async function updateOrderStatus(req, res) {
  const data = await driverService.updateDriverOrderStatus(req.user.id, req.params.id, req.body.status)
  res.json(data)
}

export async function updateLocation(req, res) {
  const data = await driverService.updateDriverLocation(req.user.id, req.body)
  res.json(data)
}
