import { prisma } from '../db/client.js'
import { AppError } from './errorHandler.js'
import { verifyAccessToken } from '../utils/jwt.js'

export async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const tokenFromQuery = typeof req.query?.token === 'string' ? req.query.token : null
  const token = tokenFromHeader || tokenFromQuery
  if (!token) {
    return next(new AppError('Unauthorized', 401))
  }

  try {
    const payload = verifyAccessToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) {
      return next(new AppError('Unauthorized', 401))
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    }

    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403))
    }
    next()
  }
}
