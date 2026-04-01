import bcrypt from 'bcryptjs'
import { prisma } from '../../db/client.js'
import { AppError } from '../../middleware/errorHandler.js'
import { createId } from '../../utils/id.js'
import { sha256 } from '../../utils/hash.js'
import { ttlToDate } from '../../utils/datetime.js'
import { env } from '../../config/env.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js'

function createTokens(user) {
  const payload = { sub: user.id, role: user.role, email: user.email }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  return { accessToken, refreshToken }
}

export async function register(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new AppError('Email already exists', 409)
  }

  const passwordHash = await bcrypt.hash(input.password, 10)
  const user = await prisma.user.create({
    data: {
      id: createId(),
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
  })

  if (input.role === 'driver') {
    await prisma.driver.create({
      data: {
        id: createId(),
        userId: user.id,
        phone: input.phone || null,
      },
    })
  }

  const { accessToken, refreshToken } = createTokens(user)
  await prisma.refreshToken.create({
    data: {
      id: createId(),
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: ttlToDate(env.REFRESH_TOKEN_TTL),
    },
  })

  return { user, accessToken, refreshToken }
}

export async function login(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    throw new AppError('Invalid credentials', 401)
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    throw new AppError('Invalid credentials', 401)
  }

  const { accessToken, refreshToken } = createTokens(user)
  await prisma.refreshToken.create({
    data: {
      id: createId(),
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: ttlToDate(env.REFRESH_TOKEN_TTL),
    },
  })

  return { user, accessToken, refreshToken }
}

export async function refresh(refreshToken) {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError('Invalid refresh token', 401)
  }

  const tokenRow = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash: sha256(refreshToken),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  })

  if (!tokenRow) {
    throw new AppError('Refresh token revoked or expired', 401)
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user) {
    throw new AppError('User not found', 404)
  }

  const nextTokens = createTokens(user)
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: tokenRow.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({
      data: {
        id: createId(),
        userId: user.id,
        tokenHash: sha256(nextTokens.refreshToken),
        expiresAt: ttlToDate(env.REFRESH_TOKEN_TTL),
      },
    }),
  ])

  return { user, ...nextTokens }
}

export async function logout(refreshToken) {
  const tokenHash = sha256(refreshToken)
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
