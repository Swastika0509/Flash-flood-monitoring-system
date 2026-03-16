// src/hooks/useGeolocation.js
import { useEffect, useRef } from 'react'
import { useUser } from '../store/useUser'

export default function useGeolocation({ enabled }) {
  const watcher = useRef(null)
  const setLocation = useUser(s => s.setLocation)
  const upsertProfile = useUser(s => s.upsertProfile)
  const session = useUser(s => s.session)

  useEffect(() => {
    if (!enabled) return
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation not supported')
      return
    }

    watcher.current = navigator.geolocation.watchPosition(
      pos => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setLocation(lat, lon)

        // write coords to Supabase profile for this user
        if (session) {
          upsertProfile({
            email: session.user.email,
            latitude: lat,
            longitude: lon,
          }).catch(err => console.warn('Upsert profile coords error', err))
        }
      },
      err => {
        console.warn('Geo error', err)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    return () => {
      if (watcher.current != null) navigator.geolocation.clearWatch(watcher.current)
    }
  }, [enabled, setLocation, upsertProfile, session])
}
