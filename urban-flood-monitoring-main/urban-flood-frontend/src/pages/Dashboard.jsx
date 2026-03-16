// src/pages/Dashboard.jsx
import React, { useEffect } from 'react'
import { useSensors } from '../store/useSensors'
import { useUser } from '../store/useUser'
import StatusCard from '../components/StatusCard'
import { Activity, Droplets, Gauge, Waves } from 'lucide-react'
import MapView from '../components/MapView'
import AlertsPanel from '../components/AlertsPanel'
import ControlPanel from '../components/ControlPanel'
import LiveRiskTracker from '../components/LiveRiskTracker' // keeps live polling from backend if you have it

export default function Dashboard() {
  const { sensors, startSimulation, simRunning } = useSensors()
  const risk = useUser(s => s.risk) // live flood alert from backend
  const user = useUser(s => s.user)

  // Start simulation automatically (for your mock sensors)
  useEffect(() => {
    if (!simRunning) startSimulation()
  }, [simRunning, startSimulation])

  // Compute fallbacks / display values
  const riskLevel = risk?.alert_level ?? 'Unknown'
  const color = risk?.color ?? '#64748b' // fallback gray
  const lat = risk?.latitude ?? user?.latitude ?? '—'
  const lon = risk?.longitude ?? user?.longitude ?? '—'

  // Optional nice display for color: small swatch + hex/name
  const ColorCardContent = () => (
    <div className="flex items-center gap-3">
      <div
        aria-hidden
        style={{ backgroundColor: color }}
        className="w-8 h-8 rounded-full ring-2 ring-white/10"
      />
      <div>
        <div className="text-sm font-medium">Color</div>
        <div className="text-xs text-gray-300 break-words">{String(color)}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 p-6">
      {/* Invisible tracker to keep risk updated */}
      <LiveRiskTracker />

      {/* Top : new metric cards showing current user risk data */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Risk Level"
          value={String(riskLevel)}
          caption="Current ML evaluation"
          icon={<Activity className="h-6 w-6 text-red-500" />}
        />

        <StatusCard
          title="Color"
          value={<ColorCardContent />}
          caption="Visualization color"
          icon={<Gauge className="h-6 w-6 text-brand-700" />}
        />

        <StatusCard
          title="Latitude"
          value={typeof lat === 'number' ? lat.toFixed(6) : lat}
          caption="User / predicted location"
          icon={<Droplets className="h-6 w-6 text-sky-600" />}
        />

        <StatusCard
          title="Longitude"
          value={typeof lon === 'number' ? lon.toFixed(6) : lon}
          caption="User / predicted location"
          icon={<Waves className="h-6 w-6 text-emerald-600" />}
        />
      </section>

      {/* Map + (removed risk trend chart) */}
      <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        <MapView />
      </section>

      {/* Alerts + Control Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertsPanel />
        <ControlPanel />
      </section>
    </div>
  )
}
