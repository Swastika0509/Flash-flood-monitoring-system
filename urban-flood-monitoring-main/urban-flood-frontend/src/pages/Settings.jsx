// src/pages/Settings.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useUser } from '../store/useUser'
import StatusCard from '../components/StatusCard'
import { Activity, Gauge, Droplets, Waves } from 'lucide-react'
import MapView from '../components/MapView'
import AlertsPanel from '../components/AlertsPanel'
import ControlPanel from '../components/ControlPanel'
import LiveRiskTracker from '../components/LiveRiskTracker' // optional parity

const ALERT_AUDIO = '/src/assets/alert.mp3' // ensure this file exists or replace with a valid path

export default function Settings() {
  const user = useUser(s => s.user)
  const setRisk = useUser(s => s.setRisk)
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    // prepare alert audio
    audioRef.current = typeof window !== 'undefined' ? new Audio(ALERT_AUDIO) : null
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Run prediction and update store
  // note: we send preset: 'settings' so backend uses the Settings high-risk sample
  async function runPrediction(latitude, longitude, autoNotify = true) {
    setLoading(true)
    try {
      const payload = {
        Latitude: Number(latitude),
        Longitude: Number(longitude),
        preset: 'settings' // <-- use high-risk sensor values for Settings page
      }

      const res = await fetch(`${apiBase}/predict/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Prediction failed')
      }
      const result = await res.json()

      const riskObj = {
        latitude: result.latitude,
        longitude: result.longitude,
        flood_probability: result.flood_probability,
        alert_level: result.alert_level,
        color: result.color,
        message: result.message,
        sensor_data: result.sensor_data,
        timestamp: new Date().toISOString(),
      }

      // update global store so MapView / StatusCards update
      setRisk(riskObj)

      // If high/severe -> play sound and notify
      if (['High', 'Severe'].includes(result.alert_level)) {
        try { audioRef.current?.play().catch(()=>{}) } catch (e) {}
        if (autoNotify) {
          // attempt to fetch saved profile (email/phone) from supabase if available
          let profile = null
          try {
            if (window.supabase && user?.email) {
              const { data, error } = await window.supabase
                .from('profiles')
                .select('email, phone')
                .eq('email', user.email)
                .single()
              if (!error) profile = data
            }
          } catch (e) {
            console.warn('profile fetch failed', e)
          }

          const notifyPayload = {
            email: profile?.email || user?.email || null,
            phone: profile?.phone || null,
            subject: `🚨 Flood Alert - ${result.alert_level}`,
            message: result.message,
          }
          try {
            // backend route that sends notifications
            await fetch(`${apiBase}/notify/all`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(notifyPayload),
            })
          } catch (err) {
            console.error('notify/all failed', err)
          }
        }
      }
    } catch (err) {
      console.error('runPrediction error', err)
      alert('Prediction error: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleRunNow = async (e) => {
    e?.preventDefault?.()
    if (!lat || !lon) return alert('Enter latitude and longitude')
    await runPrediction(lat, lon, true)
  }

  const handleStartAuto = () => {
    if (!lat || !lon) return alert('Enter latitude and longitude first')
    if (timerRef.current) clearInterval(timerRef.current)
    runPrediction(lat, lon, true) // immediate
    timerRef.current = setInterval(() => runPrediction(lat, lon, true), 15000) // every 15s
    setRunning(true)
  }

  const handleStopAuto = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRunning(false)
  }

  const risk = useUser(s => s.risk)
  const riskLevel = risk?.alert_level ?? 'Unknown'
  const color = risk?.color ?? '#64748b'
  const rlat = risk?.latitude ?? lat ?? '—'
  const rlon = risk?.longitude ?? lon ?? '—'

  return (
    <div className="space-y-6 p-6">
      <LiveRiskTracker />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card card-pad md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Settings — Manual Location</h2>
          <p className="text-sm text-gray-400 mb-4">
            Enter coordinates and click <strong>Run Now</strong> to simulate a sensor prediction. The sensor values are provided by the backend; details appear in the marker popup on the map after running.
          </p>

          <form className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end" onSubmit={handleRunNow}>
            <div>
              <label className="block text-sm mb-1">Latitude</label>
              <input className="w-full input" value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 28.5550" />
            </div>

            <div>
              <label className="block text-sm mb-1">Longitude</label>
              <input className="w-full input" value={lon} onChange={e => setLon(e.target.value)} placeholder="e.g. 77.3439" />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Running...' : 'Run Now'}</button>
              <button type="button" className="btn-outline" onClick={handleStartAuto} disabled={running}>Start Auto</button>
              <button type="button" className="btn-outline" onClick={handleStopAuto} disabled={!running}>Stop</button>
            </div>
          </form>

          {/* NOTE: removed inline simulated sensor display as requested */}

        </div>

        <div className="space-y-3">
          <StatusCard title="Risk Level" value={String(riskLevel)} caption="ML evaluation" icon={<Activity className="h-6 w-6 text-red-500" />} />
          <StatusCard
            title="Color"
            value={<div className="flex items-center gap-2"><div style={{ backgroundColor: color }} className="w-6 h-6 rounded-full" /> <span className="text-xs">{color}</span></div>}
            caption="Visualization color"
            icon={<Gauge className="h-6 w-6 text-brand-700" />}
          />
          <StatusCard title="Latitude" value={typeof rlat === 'number' ? rlat.toFixed(6) : rlat} caption="Selected location" icon={<Droplets className="h-6 w-6 text-sky-600" />} />
          <StatusCard title="Longitude" value={typeof rlon === 'number' ? rlon.toFixed(6) : rlon} caption="Selected location" icon={<Waves className="h-6 w-6 text-emerald-600" />} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MapView />
        </div>
        <div className="space-y-4">
          <AlertsPanel />
          <ControlPanel />
        </div>
      </div>
    </div>
  )
}