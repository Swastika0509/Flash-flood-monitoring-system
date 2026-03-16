import React from 'react'
import { Waves, TrafficCone, RotateCw, Siren, Shield, AlertTriangle, LifeBuoy, Users } from 'lucide-react'
import { useSensors } from '../store/useSensors'

const CONTROL_STRATEGIES = [
  { icon: <Waves className="h-4 w-4" />, text: 'Activate local pumps and ensure drainage channels are clear.' },
  { icon: <RotateCw className="h-4 w-4" />, text: 'Open diversion channels or floodgates gradually to redirect excess water.' },
  { icon: <TrafficCone className="h-4 w-4" />, text: 'Reroute traffic via ring roads and update smart traffic signals for smooth evacuation.' },
  { icon: <AlertTriangle className="h-4 w-4" />, text: 'Issue flood alerts via public address, SMS, and mobile apps for nearby zones.' },
  { icon: <Shield className="h-4 w-4" />, text: 'Deploy emergency response teams and sandbag barriers at key choke points.' },
  { icon: <Users className="h-4 w-4" />, text: 'Coordinate with police and volunteers to guide pedestrians to safe shelters.' },
  { icon: <LifeBuoy className="h-4 w-4" />, text: 'Prepare rescue boats and life jackets in low-lying areas.' },
  { icon: <Siren className="h-4 w-4" />, text: 'Activate sirens and visual beacons for quick crowd direction in high-risk zones.' },
]

export default function ControlPanel() {
  const sensors = useSensors(s => s.sensors)
  const highRisk = sensors.filter(s => s.riskScore >= 80)

  return (
    <div className="card card-pad">
      <h3 className="font-semibold mb-3">Suggested Control & Crowd Management Strategies</h3>
      {highRisk.length === 0 ? (
        <p className="text-sm text-gray-500">No high-risk zones right now.</p>
      ) : (
        <ul className="mt-1 text-sm text-gray-700 dark:text-gray-300 list-disc ml-5 space-y-2">
          {CONTROL_STRATEGIES.map((strategy, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {strategy.icon}
              {strategy.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}