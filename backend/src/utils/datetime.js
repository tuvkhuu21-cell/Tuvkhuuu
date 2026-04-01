export function ttlToDate(ttl) {
  const now = Date.now()
  const match = String(ttl).trim().match(/^(\d+)([smhd])$/i)
  if (!match) {
    return new Date(now + 7 * 24 * 60 * 60 * 1000)
  }

  const amount = Number(match[1])
  const unit = match[2].toLowerCase()
  const unitMs = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return new Date(now + amount * unitMs[unit])
}
