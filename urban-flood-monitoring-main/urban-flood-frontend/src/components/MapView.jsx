// src/components/MapView.jsx
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useUser } from '../store/useUser'

// Prevent broken default icons
delete L.Icon.Default.prototype._getIconUrl

const userIcon = new L.DivIcon({
  html: `<div class="w-4 h-4 bg-blue-400 rounded-full animate-pulse absolute"></div>
         <div class="w-3 h-3 bg-blue-700 rounded-full relative"></div>`,
  className: '',
  iconSize: [12, 12],
})

function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 13, { animate: true })
  }, [center, map])
  return null
}

export default function MapView() {
  const user = useUser(s => s.user)
  const risk = useUser(s => s.risk)
  const [loc, setLoc] = useState(null)

  useEffect(() => {
    // prefer latest risk coordinates (set when Run Now executed)
    if (risk?.latitude && risk?.longitude) {
      setLoc([risk.latitude, risk.longitude])
      return
    }
    // fallback: try user profile coords from supabase if available
    async function getProfileCoords() {
      if (!user?.email) return
      const { data, error } = await window.supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('email', user.email)
        .single()
      if (!error && data?.latitude && data?.longitude) setLoc([data.latitude, data.longitude])
    }
    getProfileCoords()
  }, [risk, user])

  const center = loc || [12.976, 77.599]
  const color = risk?.color || '#64748b'
  const sensor = risk?.sensor_data || null // this will be present after Run Now (backend returns sample_input)

  return (
    <div className="card card-pad">
      <h3 className="font-semibold mb-3">Flood Risk Map</h3>
      <div className="h-[420px] w-full rounded-xl overflow-hidden">
        <MapContainer center={center} zoom={12} className="h-full w-full" aria-label="Flood risk map">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={center} />

          {loc && (
            <>
              <Marker position={loc} icon={userIcon}>
                <Popup>
                  <div className="text-sm">
                    <strong>Your Location</strong>
                    <div>Lat: {loc[0].toFixed(6)}, Lon: {loc[1].toFixed(6)}</div>
                    <hr className="my-2"/>
                    <strong>Risk Level:</strong> {risk?.alert_level ?? 'Unknown'} <br />
                    <strong>Probability:</strong> {risk?.flood_probability ? (risk.flood_probability*100).toFixed(2) + '%' : '—'} <br />
                    <strong>Message:</strong> {risk?.message ?? '—'} <br />
                    <hr className="my-2"/>
                    <strong>IoT Sensor Data (simulated):</strong>
                    <div className="text-xs mt-1">
                      {sensor ? (
                        <ul className="list-none pl-0">
                          <li>Rainfall: {Array.isArray(sensor.Rainfall) ? sensor.Rainfall[0] : sensor.Rainfall}</li>
                          <li>Temperature: {Array.isArray(sensor.Temperature) ? sensor.Temperature[0] : sensor.Temperature}</li>
                          <li>Humidity: {Array.isArray(sensor.Humidity) ? sensor.Humidity[0] : sensor.Humidity}</li>
                          <li>River Discharge: {Array.isArray(sensor['River Discharge']) ? sensor['River Discharge'][0] : sensor['River Discharge']}</li>
                          <li>Water Level: {Array.isArray(sensor['Water Level']) ? sensor['Water Level'][0] : sensor['Water Level']}</li>
                          <li>Elevation: {Array.isArray(sensor.Elevation) ? sensor.Elevation[0] : sensor.Elevation}</li>
                          <li>Population Density: {Array.isArray(sensor['Population Density']) ? sensor['Population Density'][0] : sensor['Population Density']}</li>
                        </ul>
                      ) : (
                        <div className="text-xs text-gray-400">Sensor data will appear here after you click "Run Now".</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* 10km radius */}
              <Circle center={loc} radius={10000} color={color} fillColor={color} fillOpacity={0.12} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  )
}