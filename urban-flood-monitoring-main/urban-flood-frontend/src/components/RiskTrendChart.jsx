import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useSensors } from '../store/useSensors'

export default function RiskTrendChart() {
  const history = useSensors(s => s.history)
  const data = history.map(h => ({ time: new Date(h.t).toLocaleTimeString(), risk: h.avgRisk }))

  return (
    <div className="card card-pad">
      <h3 className="font-semibold mb-3">Citywide Risk Trend (avg)</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <ReferenceLine y={65} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="risk" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
