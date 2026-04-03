import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'https://tuvkhuuu.onrender.com/api'
const client = axios.create({
  baseURL,
  withCredentials: true,
})

let accessToken = null
let refreshingPromise = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (!error.response || error.response.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) {
      throw error
    }

    if (!refreshingPromise) {
      refreshingPromise = client.post('/auth/refresh', {}).finally(() => {
        refreshingPromise = null
      })
    }

    try {
      const refreshResponse = await refreshingPromise
      accessToken = refreshResponse.data.accessToken
      original._retry = true
      original.headers.Authorization = `Bearer ${accessToken}`
      return client(original)
    } catch (refreshError) {
      accessToken = null
      throw refreshError
    }
  },
)

export const api = {
  async register(payload) {
    const res = await client.post('/auth/register', payload)
    return res.data
  },
  async login(payload) {
    const res = await client.post('/auth/login', payload)
    return res.data
  },
  async logout(payload = {}) {
    const res = await client.post('/auth/logout', payload)
    return res.data
  },
  async me() {
    const res = await client.get('/auth/me')
    return res.data
  },
  async createOrder(payload) {
    const res = await client.post('/orders', payload)
    return res.data
  },
  async getOrders() {
    const res = await client.get('/orders')
    return res.data
  },
  async getOrder(orderId) {
    const res = await client.get(`/orders/${orderId}`)
    return res.data
  },
  async getOrderTimeline(orderId) {
    const res = await client.get(`/orders/${orderId}/timeline`)
    return res.data
  },
  async createPaymentIntent(payload) {
    const res = await client.post('/payments/create-intent', payload)
    return res.data
  },
  async confirmPayment(payload) {
    const res = await client.post('/payments/confirm', payload)
    return res.data
  },
  async getPaymentHistory(orderId) {
    const res = await client.get(`/payments/history/${orderId}`)
    return res.data
  },
  async getTracking(orderId) {
    const res = await client.get(`/tracking/${orderId}`)
    return res.data
  },
  async getDriverProfile() {
    const res = await client.get('/driver/me')
    return res.data
  },
  async getAvailableOrders() {
    const res = await client.get('/driver/available-orders')
    return res.data
  },
  async acceptAvailableOrder(orderId) {
    const res = await client.post(`/driver/available-orders/${orderId}/accept`)
    return res.data
  },
  async getDriverOrders() {
    const res = await client.get('/driver/assigned-orders')
    return res.data
  },
  async getDriverActiveOrder() {
    const res = await client.get('/driver/active-order')
    return res.data
  },
  async getDriverCompletedOrders() {
    const res = await client.get('/driver/completed-orders')
    return res.data
  },
  async getDriverOrder(orderId) {
    const res = await client.get(`/driver/orders/${orderId}`)
    return res.data
  },
  async driverAccept(orderId) {
    const res = await client.post(`/driver/orders/${orderId}/accept`)
    return res.data
  },
  async driverReject(orderId) {
    const res = await client.post(`/driver/orders/${orderId}/reject`)
    return res.data
  },
  async driverUpdateStatus(orderId, status) {
    const res = await client.post(`/driver/orders/${orderId}/status`, { status })
    return res.data
  },
  async driverAvailability(status) {
    const res = await client.post('/driver/status', { status })
    return res.data
  },
  async driverLocation(payload) {
    const res = await client.post('/driver/location', payload)
    return res.data
  },
  async getAllActiveOrders() {
    const res = await client.get('/driver/all-active-orders')
    return res.data
  },
  async dashboardSummary() {
    const res = await client.get('/dashboard/summary')
    return res.data
  },
  async dashboardDelays() {
    const res = await client.get('/dashboard/delays')
    return res.data
  },
  async dashboardActiveDeliveries() {
    const res = await client.get('/dashboard/active-deliveries')
    return res.data
  },
  async dashboardPaymentSummary() {
    const res = await client.get('/dashboard/payment-summary')
    return res.data
  },
  async adminOrders() {
    const res = await client.get('/admin/orders')
    return res.data
  },
  async adminOrder(orderId) {
    const res = await client.get(`/admin/orders/${orderId}`)
    return res.data
  },
  async adminAssignOrder(orderId, driverId) {
    const res = await client.post(`/admin/orders/${orderId}/assign`, { driverId })
    return res.data
  },
  async adminDrivers() {
    const res = await client.get('/admin/drivers')
    return res.data
  },
  async adminDriver(driverId) {
    const res = await client.get(`/admin/drivers/${driverId}`)
    return res.data
  },
}
