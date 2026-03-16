// src/components/LiveRiskTracker.jsx
import React, { useEffect, useRef } from 'react'
import { useUser } from '../store/useUser'
import alertSound from '../assets/alert.mp3' // add an mp3 in src/assets or change path

export default function LiveRiskTracker() {
  const user = useUser((s) => s.user)
  const setRisk = useUser((s) => s.setRisk)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = typeof window !== 'undefined' ? new Audio(alertSound) : null
    }
  }, [])

  useEffect(() => {
    if (!user?.email) return

    let mounted = true

    async function fetchAndUpdate() {
      try {
        // fetch profile from supabase (latitude, longitude, phone, email)
        const { data, error } = await window.supabase
          .from('profiles')
          .select('latitude, longitude, phone, email')
          .eq('email', user.email)
          .single()

        if (error) {
          console.error('LiveRiskTracker: supabase fetch error', error)
          return
        }
        if (!data?.latitude || !data?.longitude) {
          console.warn('LiveRiskTracker: no coords saved for user yet')
          return
        }

        const payload = { Latitude: data.latitude, Longitude: data.longitude }

        // call backend predict endpoint
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/predict/alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const txt = await res.text()
          console.error('LiveRiskTracker: backend error', txt)
          return
        }

        const result = await res.json()
        if (!mounted) return

        // set risk in store
        setRisk({
          latitude: result.latitude,
          longitude: result.longitude,
          flood_probability: result.flood_probability,
          alert_level: result.alert_level,
          color: result.color,
          message: result.message,
          sensor_data: result.sensor_data, // this contains our hardcoded inputs
          timestamp: new Date().toISOString(),
        })

        // If high or severe, play sound (only once per update)
        if (['High', 'Severe'].includes(result.alert_level) && audioRef.current) {
          try { audioRef.current.play().catch(()=>{}) } catch(e){}
        }

        // Optionally: trigger notify endpoint to send email/SMS.
        // You can enable this if you want auto-notifications:
        // await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/notify/all`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email: data.email, phone: data.phone, message: result.message }),
        // })

      } catch (e) {
        console.error('LiveRiskTracker error', e)
      }
    }

    // initial call and then poll every 30s (adjust as needed)
    fetchAndUpdate()
    const id = setInterval(fetchAndUpdate, 30000)

    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [user, setRisk])

  return null // invisible component
}