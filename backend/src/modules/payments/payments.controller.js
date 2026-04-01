import * as paymentsService from './payments.service.js'

export async function createIntent(req, res) {
  const result = await paymentsService.createPaymentIntent(req.body, req.user)
  res.status(201).json(result)
}

export async function confirm(req, res) {
  const result = await paymentsService.confirmPayment(req.body, req.user)
  res.json(result)
}

export async function webhook(req, res) {
  const result = await paymentsService.handleWebhook(req.body)
  res.json(result)
}

export async function getByOrder(req, res) {
  const result = await paymentsService.getPaymentByOrderId(req.params.orderId, req.user)
  res.json(result)
}

export async function getHistory(req, res) {
  const result = await paymentsService.getPaymentHistory(req.params.orderId, req.user)
  res.json(result)
}

export async function markCod(req, res) {
  const result = await paymentsService.markCashOnDeliveryPaid(req.params.orderId, req.user)
  res.json(result)
}

export async function refund(req, res) {
  const result = await paymentsService.refundPayment(req.params.orderId, req.user, req.body.reason)
  res.json(result)
}
