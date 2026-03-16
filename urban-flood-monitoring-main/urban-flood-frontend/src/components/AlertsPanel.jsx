// src/components/AlertsPanel.jsx
import React from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useUser } from '../store/useUser'

export default function AlertsPanel() {
  const risk = useUser(s => s.risk)

  // Determine alert visibility
  const showAlert =
    risk && ['Moderate', 'High', 'Severe'].includes(risk.alert_level)

  return (
    <div className="card card-pad">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
        <h3 className="font-semibold">Recent Alerts</h3>
      </div>

      {/* No risk or Safe → show all clear */}
      {!showAlert && (
        <div className="flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
          <span>All clear. No flood alerts at this time.</span>
        </div>
      )}

      {/* Active flood risk → show alert */}
      {showAlert && (
        <ul role="list" className="space-y-2">
          <li
            className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
              risk.alert_level === 'Severe'
                ? 'border-red-600 bg-red-950/20'
                : risk.alert_level === 'High'
                ? 'border-orange-500 bg-orange-900/20'
                : 'border-yellow-400 bg-yellow-900/20'
            }`}
          >
            <div>
              <p
                className={`text-sm font-medium ${
                  risk.alert_level === 'Severe'
                    ? 'text-red-500'
                    : risk.alert_level === 'High'
                    ? 'text-orange-400'
                    : 'text-yellow-300'
                }`}
              >
                🚨 {risk.alert_level.toUpperCase()} risk detected!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {risk.message || 'Flooding risk identified by ML model.'}
              </p>

              <div className="mt-2 text-xs text-gray-400">
                <strong>Flood Probability:</strong>{' '}
                {(risk.flood_probability * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">
                <strong>Location:</strong>{' '}
                {risk.latitude && risk.longitude
                  ? `${risk.latitude.toFixed(4)}, ${risk.longitude.toFixed(4)}`
                  : 'Unknown'}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Updated at: {new Date().toLocaleTimeString()}
              </p>
            </div>

            <span
              className={`inline-flex h-2 w-2 rounded-full mt-1 ${
                risk.alert_level === 'Severe'
                  ? 'bg-red-500'
                  : risk.alert_level === 'High'
                  ? 'bg-orange-400'
                  : 'bg-yellow-300'
              }`}
              aria-hidden="true"
            />
          </li>
        </ul>
      )}
    </div>
  )
}