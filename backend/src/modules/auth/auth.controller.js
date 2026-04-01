import * as authService from './auth.service.js'

const REFRESH_COOKIE = 'refreshToken'

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/api/auth',
  })
}

export async function register(req, res) {
  const result = await authService.register(req.body)
  setRefreshCookie(res, result.refreshToken)
  res.status(201).json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
  })
}

export async function login(req, res) {
  const result = await authService.login(req.body)
  setRefreshCookie(res, result.refreshToken)
  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
  })
}

export async function refresh(req, res) {
  const token = req.body.refreshToken || req.cookies[REFRESH_COOKIE]
  const result = await authService.refresh(token)
  setRefreshCookie(res, result.refreshToken)
  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
  })
}

export async function logout(req, res) {
  const token = req.body?.refreshToken || req.cookies[REFRESH_COOKIE]
  if (token) {
    await authService.logout(token)
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
  res.status(204).send()
}

export async function me(req, res) {
  res.json({ user: req.user })
}
