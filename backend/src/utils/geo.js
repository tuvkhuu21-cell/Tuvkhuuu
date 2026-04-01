export function toRad(value) {
  return (value * Math.PI) / 180
}

export function isValidCoordinate(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function movedBeyondThreshold(prevLat, prevLng, nextLat, nextLng, thresholdMeters) {
  if (!Number.isFinite(prevLat) || !Number.isFinite(prevLng)) {
    return true
  }
  return haversineMeters(prevLat, prevLng, nextLat, nextLng) >= thresholdMeters
}

export function buildBoundingBox(lat, lng, radiusMeters) {
  const latDelta = radiusMeters / 111320
  const lngDelta = radiusMeters / (111320 * Math.cos(toRad(lat)))
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}
