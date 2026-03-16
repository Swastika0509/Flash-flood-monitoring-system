// Simple, deterministic risk scoring used for frontend simulation
export function computeRiskScore({ rainfall, waterLevel, flowRate }) {
  const r = Math.min(rainfall / 200, 1)
  const wl = Math.min(waterLevel / 3, 1)
  const fr = Math.min(flowRate / 2, 1)
  return Math.round((r * 0.4 + wl * 0.4 + fr * 0.2) * 100)
}

export function riskBand(score) {
  if (score >= 85) return 'Severe'
  if (score >= 65) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

export function bandColor(score) {
  if (score >= 85) return '#dc2626'
  if (score >= 65) return '#f59e0b'
  if (score >= 40) return '#10b981'
  return '#22c55e'
}
