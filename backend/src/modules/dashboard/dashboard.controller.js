import * as dashboardService from './dashboard.service.js'
import { AppError } from '../../middleware/errorHandler.js'

export async function getSummary(_req, res) {
  const result = await dashboardService.getSummary()
  res.json(result)
}

export async function getDailyStats(_req, res) {
  const result = await dashboardService.getDailyStats()
  res.json(result)
}

export async function getDelays(_req, res) {
  const result = await dashboardService.getDelays()
  res.json(result)
}

export async function getActiveDeliveries(_req, res) {
  const result = await dashboardService.getActiveDeliveries()
  res.json(result)
}

export async function getPaymentSummary(_req, res) {
  const result = await dashboardService.getPaymentSummary()
  res.json(result)
}

export async function getDriverAvailability(req, res) {
  if (req.user.role !== 'admin') {
    throw new AppError('Only admin can view driver availability monitoring', 403)
  }

  const result = await dashboardService.getDriverAvailabilityList()
  res.json(result)
}
