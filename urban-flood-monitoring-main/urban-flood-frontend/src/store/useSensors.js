import { create } from 'zustand'
import { computeRiskScore } from '../lib/risk'

const seed = [
  { id: 'S1', name: 'Drain-Alpha', lat: 12.979, lng: 77.591 },
  { id: 'S2', name: 'Drain-Beta', lat: 12.975, lng: 77.604 },
  { id: 'S3', name: 'Junction-Gamma', lat: 12.969, lng: 77.59 },
  { id: 'S4', name: 'Low-lying Delta', lat: 12.967, lng: 77.601 },
  { id: 'S5', name: 'Canal-Epsilon', lat: 12.984, lng: 77.608 },
]

let timer = null

export const useSensors = create((set, get) => ({
  sensors: seed.map(s => ({
    ...s, rainfall: 0, waterLevel: 0, flowRate: 0, riskScore: 0, updatedAt: Date.now()
  })),
  alerts: [],
  history: [],
  simRunning: false,

  startSimulation: () => {
    if (timer) return
    timer = setInterval(() => {
      const now = Date.now()
      const sensors = get().sensors.map(s => {
        const rainfall = Math.max(0, Math.min(200, s.rainfall + (Math.random() * 40 - 10)))
        const waterLevel = Math.max(0, Math.min(3, s.waterLevel + (Math.random() * 0.4 - 0.05)))
        const flowRate = Math.max(0, Math.min(2, s.flowRate + (Math.random() * 0.2 - 0.05)))
        const riskScore = computeRiskScore({ rainfall, waterLevel, flowRate })
        return { ...s, rainfall, waterLevel, flowRate, riskScore, updatedAt: now }
      })

      const newAlerts = sensors
        .filter(s => s.riskScore >= 80)
        .map(s => ({
          id: `A-${s.id}-${now}`,
          sensorId: s.id,
          level: s.riskScore >= 90 ? 'danger' : 'warning',
          message: s.riskScore >= 90
            ? `${s.name}: SEVERE risk. Consider pump activation & traffic diversion.`
            : `${s.name}: High risk. Monitor closely.`,
          time: now
        }))

      const avg = Math.round(sensors.reduce((a, s) => a + s.riskScore, 0) / sensors.length)

      set(st => ({
        sensors,
        alerts: [...newAlerts, ...st.alerts].slice(0, 25),
        history: [...st.history, { t: now, avgRisk: avg }].slice(-60),
        simRunning: true
      }))
    }, 3000)
  },

  stopSimulation: () => {
    if (timer) clearInterval(timer)
    timer = null
    set({ simRunning: false })
  }
}))
