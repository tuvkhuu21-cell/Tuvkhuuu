import * as adminService from './admin.service.js'

export async function listOrders(_req, res) {
  const data = await adminService.listAdminOrders()
  res.json(data)
}

export async function getOrderById(req, res) {
  const data = await adminService.getAdminOrderById(req.params.id)
  res.json(data)
}

export async function assignOrder(req, res) {
  const data = await adminService.assignOrderByAdmin(req.params.id, req.user.id, req.body.driverId)
  res.json(data)
}

export async function listDrivers(_req, res) {
  const data = await adminService.listAdminDrivers()
  res.json(data)
}

export async function getDriverById(req, res) {
  const data = await adminService.getAdminDriverById(req.params.id)
  res.json(data)
}
