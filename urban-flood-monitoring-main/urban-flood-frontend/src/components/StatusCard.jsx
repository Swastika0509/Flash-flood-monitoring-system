import React from 'react'

export default function StatusCard({ title, value, caption, icon }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center gap-3">
        {icon}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
          {caption && <p className="text-xs text-gray-500">{caption}</p>}
        </div>
      </div>
    </div>
  )
}
