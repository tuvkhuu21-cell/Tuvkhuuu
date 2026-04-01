import * as ordersService from './orders.service.js'

export async function listOrders(req, res) {
  const orders = await ordersService.listOrders(req.user)
  res.json(orders)
}

export async function createOrder(req, res) {
  const order = await ordersService.createOrder(req.user.id, req.body)
  res.status(201).json(order)
}

export async function getOrderById(req, res) {
  const order = await ordersService.getOrderById(req.params.id, req.user)
  res.json(order)
}

export async function getTimeline(req, res) {
  const timeline = await ordersService.getTimeline(req.params.id, req.user)
  res.json(timeline)
}

export async function assignOrder(req, res) {
  const order = await ordersService.assignOrder(req.params.id, req.user, req.body.driverId)
  res.json(order)
}

export async function updateOrderStatus(req, res) {
  const order = await ordersService.updateOrderStatus(req.params.id, req.body.status, req.user)
  res.json(order)
}
