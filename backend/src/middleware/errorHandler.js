export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

export function notFoundHandler(_req, _res, next) {
  next(new AppError('Route not found', 404))
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    details: error.details || null,
  })
}
